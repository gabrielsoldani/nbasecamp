import $ from "jquery";
import { computeFriendlyDifferenceFromNow } from "../utils/time";
import { setEndOfContenteditable } from "../utils/content-editable";

const buildLineBodyRecursiveMessageFromNode = (node) => {
	let message = $(node).text().trim();
	const tagName = $(node).prop("tagName");

	if (tagName === "BLOCKQUOTE") {
		const contents = $(node).contents();
		const messages = contents
			.toArray()
			.map((element) => buildLineBodyRecursiveMessageFromNode(element));

		return messages.join(" ");
	}

	if (tagName === "BC-ATTACHMENT") {
		return `@${message}`;
	}

	return message;
};

const tryBuildReplyBodyMessageFromLineBodyNodes = (lineBodyNodes) => {
	return lineBodyNodes
		.map((element) => {
			let message = "";

			try {
				message = buildLineBodyRecursiveMessageFromNode(element);
			} catch (error) {
				return "error";
			}

			return message;
		})
		.filter((text) => text.length > 0)
		.join(" ");
};

const removeReplyButtons = () => {
	$(".btn-reply, .btn-reply-all").detach();
};

const renderReplyButtons = () => {
	$("article")
		.not(".chat-line--me")
		.append(
			`<button class="btn btn-outline-info btn-lg btn-reply" style="padding: 0px 4px 0px 4px; font-size: 1.2rem; color: grey;">Reply</button>`
		);

	$("article")
		.not(".chat-line--thread")
		.not(".chat-line--me")
		.filter((_, element) => {
			const hasNextPost = $(element).next().hasClass("chat-line--thread");

			return hasNextPost;
		})
		.append(
			`<button class="btn btn-outline-info btn-lg btn-reply-all" style="margin-left: 1px; padding: 0px 4px 0px 4px; font-size: 1.2rem; color: grey;">Reply All</button>`
		);
};

const renderReplyAllTrixMessage = (event) => {
	const creatorName = $(event.currentTarget)
		.parent()
		.find(".chat-line__author")
		.text();
	const articleCreatedAt = $(event.currentTarget)
		.parent()
		.find("time")
		.attr("datetime");
	const friendlyTimeMessage = `há ${computeFriendlyDifferenceFromNow(
		articleCreatedAt
	)} atrás`;
	const creatorId = $(event.currentTarget).parent().attr("data-creator-id");
	const articles = $(event.currentTarget)
		.parent()
		.nextUntil($(`[data-creator-id!="` + creatorId + `"]`), "article");
	const firstLineBodyNodes = $.parseHTML(
		$(event.currentTarget).parent().find(".chat-line__body").html()
	);
	const firstMessage =
		tryBuildReplyBodyMessageFromLineBodyNodes(firstLineBodyNodes);
	const nextMessages = articles
		.map((_, article) => {
			const lineBodyNode = $.parseHTML(
				$(article).find(".chat-line__body").html()
			);

			return tryBuildReplyBodyMessageFromLineBodyNodes(lineBodyNode);
		})
		.toArray()
		.map((message) => `• ${message}`)
		.join("<br>");

	const body = `• ${firstMessage} <br> ${nextMessages}`;
	const reply = `<blockquote>${creatorName} - ${friendlyTimeMessage} <br> ${body}<br><br> > </blockquote>`;

	$("trix-editor").html(reply);
	setEndOfContenteditable($("trix-editor").get(0));
};

const renderReplyOnlyTrixMessage = (event) => {
	const creatorName = $(event.currentTarget)
		.parent()
		.find(".chat-line__author")
		.text();
	const articleCreatedAt = $(event.currentTarget)
		.parent()
		.find("time")
		.attr("datetime");
	const friendlyTimeMessage = `há ${computeFriendlyDifferenceFromNow(
		articleCreatedAt
	)} atrás`;
	const article = $(event.currentTarget).closest("article")[0];
	const lineBodyNodes = $.parseHTML($(article).find(".chat-line__body").html());
	const bodyMessage = tryBuildReplyBodyMessageFromLineBodyNodes(lineBodyNodes);
	const reply = `<blockquote>${creatorName} - ${friendlyTimeMessage} <br> • ${bodyMessage}<br><br> > </blockquote>`;
	$("trix-editor").html(reply);
	setEndOfContenteditable($("trix-editor").get(0));
};

const apply = () => {
	removeReplyButtons();
	renderReplyButtons();

	$("article.chat-line")
		.off()
		.on("click", ".btn-reply-all, .btn-reply", function (event) {
			const isReplyAll = $(event.currentTarget).hasClass("btn-reply-all");

			if (isReplyAll) {
				renderReplyAllTrixMessage(event);
			} else {
				renderReplyOnlyTrixMessage(event);
			}
		});
};

export default { apply };

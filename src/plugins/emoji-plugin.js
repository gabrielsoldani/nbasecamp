import { EmojiButton } from "@joeattardi/emoji-button";
import $ from "jquery";

const apply = () => {
	const picker = new EmojiButton({ autoHide: false });
	const trigger = document.querySelector(".chat__emoji-button");
	$(".chat__emoji-picker").removeClass("emoji-picker");
	$(".emoji-picker__modal").hide();
	$(".emoji-picker__wrapper").css({ zIndex: 99 });
    
	picker.on("emoji", (selection) => {
		$("trix-editor").append(selection.emoji);
	});

	trigger.addEventListener("click", () => picker.togglePicker(trigger));
};

export default { apply };

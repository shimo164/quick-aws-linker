function Save() {

	let value = document.getElementById('input_message').value;

	chrome.storage.local.set({ key: value }).then(() => {
		console.log("Value is set to " + value);
	});

	let my_text1 = document.getElementById("text1");
	let my_text2 = document.getElementById("text2");
	let now = new Date();
	my_text1.innerHTML = "Value is set to " + value;
	my_text2.innerHTML = now.toLocaleString();
}

function Load() {
	chrome.storage.local.get('key', function (items) {
		document.getElementById('input_message').value = items.key;
	});
}


document.addEventListener('DOMContentLoaded', Load);

document.getElementById('save_button').addEventListener('click', Save);

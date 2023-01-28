chrome.runtime.onInstalled.addListener(function (details) {

	const parent = chrome.contextMenus.create({
		id: "share",
		title: "Open Lambda Page",
		contexts: ["all"],
	});

	chrome.contextMenus.create({
		parentId: parent,
		id: "lambda-console",
		title: "Lambda Console",
		contexts: ["selection"],
	});

	chrome.contextMenus.create({
		parentId: parent,
		id: "lambda-logs",
		title: "Lambda Logs",
		contexts: ["selection"],
	});
});


chrome.contextMenus.onClicked.addListener((info, tab) => {

	switch (info.menuItemId) {
		case "lambda-console":
			chrome.scripting.executeScript(
				{
					target: { tabId: tab.id },
					function: gen_lambda_url,
					args: [info, "lambda_console"]
				},
				(injectionResults) => {
					target_url = injectionResults[0].result;
					chrome.tabs.create({ url: target_url });
				}
			);
			break;
		case "lambda-logs":
			chrome.scripting.executeScript(
				{
					target: { tabId: tab.id },
					function: gen_lambda_url,
					args: [info, "lambda_logs"]
				},
				(injectionResults) => {
					target_url = injectionResults[0].result;
					chrome.tabs.create({ url: target_url });
				}
			);
			break;
	}
});

async function gen_lambda_url(info, type) {
	console.log(type);

	await chrome.storage.local.get(["key"]).then((result) => {
		console.log("Value currently is " + result.key);
		region = result.key;
	});

	const fn_name = info.selectionText;

	if (type === 'lambda_console') {
		return `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fn_name}?tab=code`;
	} else if (type === 'lambda_logs') {
		return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fn_name}`;
	}
}

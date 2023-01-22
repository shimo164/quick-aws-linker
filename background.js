chrome.runtime.onInstalled.addListener(function (details) {

	const parent = chrome.contextMenus.create({
		id: "share",
		title: "Open Lambda",
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
					function: lambda_console,
					args: [info]
				},
				(injectionResults) => {
					target_url = injectionResults[0].result;
					console.log(target_url);
					chrome.tabs.create({ url: target_url });
				}
			);
			break;
		case "lambda-logs":
			chrome.scripting.executeScript(
				{
					target: { tabId: tab.id },
					function: lambda_logs,
					args: [info]
				},
				(injectionResults) => {
					target_url = injectionResults[0].result;
					console.log(target_url);
					chrome.tabs.create({ url: target_url });
				}
			);
			break;
	}
});

function lambda_console(info) {
	const fn_name = info.selectionText;
	const region = 'ap-northeast-1';
	lambda_console_url = `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fn_name}?tab=code`;
	return lambda_console_url;
}

function lambda_logs(info) {
	const fn_name = info.selectionText;
	const region = 'ap-northeast-1';
	lambda_logs_url = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fn_name}`;
	return lambda_logs_url;
}

const targetUrlActions = {
  lambda_console: (region, fnName) =>
    `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fnName}?tab=code`,
  lambda_logs: (region, fnName) =>
    `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fnName}`,
};

function generateTargetUrl(action, region, fnName) {
  const urlGenerator = targetUrlActions[action];
  return urlGenerator ? urlGenerator(region, fnName) : '';
}

async function genLambdaUrlFromSelection(info, action) {
  const { region } = await chrome.storage.local.get(['region']);

  const fnName = info.selectionText;
  const targetUrl = generateTargetUrl(action, region, fnName);

  return { targetUrl, fnName };
}

export { generateTargetUrl, genLambdaUrlFromSelection };

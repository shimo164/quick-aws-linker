function generateTargetUrl(action, region, fnName) {
  let targetUrl = '';

  if (action === 'lambda_console') {
    targetUrl = `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fnName}?tab=code`;
  } else if (action === 'lambda_logs') {
    targetUrl = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fnName}`;
  }
  return targetUrl;
}

async function genLambdaUrlFromSelection(info, action) {
  const region = await chrome.storage.local
    .get(['region'])
    .then((result) => result.region);

  const fnName = info.selectionText;

  const targetUrl = generateTargetUrl(action, region, fnName);

  return { targetUrl, fnName };
}

export { generateTargetUrl, genLambdaUrlFromSelection };

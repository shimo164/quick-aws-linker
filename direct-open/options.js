function Save() {
  let value = document.getElementById('input_region').value;

  chrome.storage.local.set({ key: value }).then(() => {});

  let message1 = document.getElementById('save_done_message1');
  let message2 = document.getElementById('save_done_message2');
  let now = new Date();
  message1.innerHTML = 'Value is set to ' + value;
  message2.innerHTML = now.toLocaleString();
}

function Load() {
  chrome.storage.local.get('key', function (items) {
    const saved_region = items.key;
    if (typeof saved_region !== 'undefined') {
      document.getElementById('input_region').value = saved_region;
    }
  });
}
async function OpenLambda(e) {
  let target_url = '';
  let action = this.action;

  await chrome.storage.local.get(['key']).then((result) => {
    region = result.key;
  });

  const fn_name = document.getElementById('input_lambda_name').value;

  if (action === 'lambda_console') {
    target_url = `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fn_name}?tab=code`;
  } else if (action === 'lambda_logs') {
    target_url = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fn_name}`;
  }

  chrome.tabs.create({ url: target_url });
}

document.addEventListener('DOMContentLoaded', Load);

document.getElementById('save_button').addEventListener('click', Save);

document.getElementById('lambda_console_button').addEventListener('click', {
  action: 'lambda_console',
  handleEvent: OpenLambda,
});

document.getElementById('lambda_logs_button').addEventListener('click', {
  action: 'lambda_logs',
  handleEvent: OpenLambda,
});

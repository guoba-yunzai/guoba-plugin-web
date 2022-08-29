export function timeFix() {
  const time = new Date();
  const hour = time.getHours();
  return hour < 9 ? '早上好' : (hour <= 11 ? '上午好' : (hour <= 13 ? '中午好' : (hour < 20 ? '下午好' : '晚上好')));
}

export function welcome() {
  const arr = [
    '稍微休息一会儿吧~',
    '准备吃点什么呢?',
    '要不要去打个秘境呢？',
    '要不去刷个地脉花吧？',
    '让我猜猜你现在是不是累了？',
    '别忘记清树脂哦~',
  ];
  let index = Math.floor((Math.random() * arr.length));
  return arr[index];
}

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
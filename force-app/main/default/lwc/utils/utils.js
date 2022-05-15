export function logProxy(proxyObj) {
  console.log(JSON.parse(JSON.stringify(proxyObj)));
}
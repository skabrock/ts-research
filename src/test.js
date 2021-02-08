console.log("start");

setTimeout(() => {
  console.log("1");
}, 0);

const p = new Promise((resolve) => {
  resolve();
});

const p2 = new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, 0);
});

p.then(() => {
  console.log("3");
});

p.then(() => {
  console.log("2");
});

console.log("finish");

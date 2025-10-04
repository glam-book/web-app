const a = Promise.resolve(42);

for (let i = 0; i < 3; i++) {
  a.then((n) => console.log(n + i));
}

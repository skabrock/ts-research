function secret(string: string): string {
  return [...string]
    .map((l, i) => {
      // return l.toUpperCase() + new Array(i).fill(l.toLowerCase()).join("");
      return l.toUpperCase() + l.toLowerCase().repeat(i);
    })
    .join("-");
}

document.body.append(secret("test"));

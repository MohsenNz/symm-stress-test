
export function unOpt(x) {
  switch (x) {
    case null:
    case undefined:
      throw new Error("null/undefined error")
    default:
      return x
  }
}

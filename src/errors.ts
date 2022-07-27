export class NoVanillaModuleError extends Error {
  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoVanillaModuleError.prototype)
  }

  // sayHello() {
  //     return "hello " + this.message;
  // }
}

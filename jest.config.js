module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
    "fp-ts-std/(.*)": "fp-ts-std/dist/cjs/$1",
  },
}

// LSP 기능 테스트용 파일 — 테스트 후 삭제

// 1. 타입 에러 (number에 string 할당)
const count: number = "hello";

// 2. 존재하지 않는 프로퍼티 접근
const obj = { name: "test", age: 30 };
console.log(obj.address);

// 3. 함수 파라미터 타입 불일치
function add(a: number, b: number): number {
  return a + b;
}
add("1", 2);

// 4. 미사용 변수
const unusedVar = 42;

// 5. 정상 코드 (에러 없어야 함)
const greeting: string = "Hello, LSP!";
console.log(greeting);

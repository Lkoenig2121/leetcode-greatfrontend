import type { ProblemDef } from "./types";

const evens = Array.from({ length: 10_000 }, (_, i) => i * 2);
const distinct = Array.from({ length: 50_000 }, (_, i) => i);

export const easyProblems: ProblemDef[] = [
  {
    id: 1,
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    acceptance: 54.2,
    description: [
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.",
      "You may assume that each input has exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    hints: [
      "A brute force approach checks every pair in O(n^2). Can you do better?",
      "For each number, you need to know if `target - number` has already been seen. What data structure answers that in O(1)?",
    ],
    functionName: "twoSum",
    signature: [
      ["nums", "number[]"],
      ["target", "number"],
    ],
    returns: "number[]",
    compare: "unordered",
    reference: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    examples: [
      [[[2, 7, 11, 15], 9], [0, 1], "Because nums[0] + nums[1] == 9, we return [0, 1]."],
      [[[3, 2, 4], 6], [1, 2]],
      [[[3, 3], 6], [0, 1]],
    ],
    hidden: [
      [[-1, -2, -3, -4, -5], -8],
      [[0, 4, 3, 0], 0],
      [[2, 5, 5, 11], 10],
      [[1, 5, 9, 13, 17, 21, 25], 46],
      [evens, 39_994],
    ],
  },
  {
    id: 9,
    slug: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    tags: ["Math"],
    acceptance: 59.1,
    description: [
      "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
      "An integer is a palindrome when it reads the same forward and backward.",
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    hints: ["Negative numbers can never be palindromes because of the leading minus sign."],
    functionName: "isPalindrome",
    signature: [["x", "number"]],
    returns: "boolean",
    reference: `function isPalindrome(x) {
  if (x < 0) return false;
  const s = String(x);
  return s === s.split("").reverse().join("");
}`,
    examples: [
      [[121], true, "121 reads as 121 from left to right and from right to left."],
      [[-121], false, "From left to right it reads -121. From right to left it becomes 121-. Therefore it is not a palindrome."],
      [[10], false, "Reads 01 from right to left. Therefore it is not a palindrome."],
    ],
    hidden: [[0], [1221], [12321], [1000021], [2147447412], [-1]],
  },
  {
    id: 13,
    slug: "roman-to-integer",
    title: "Roman to Integer",
    difficulty: "Easy",
    tags: ["Hash Table", "Math", "String"],
    acceptance: 63.8,
    description: [
      "Roman numerals are represented by seven symbols: `I` (1), `V` (5), `X` (10), `L` (50), `C` (100), `D` (500) and `M` (1000).",
      "Numerals are usually written largest to smallest from left to right. However, a smaller value placed before a larger one means subtraction, e.g. `IV` is 4 and `IX` is 9. The same applies to `XL`, `XC`, `CD` and `CM`.",
      "Given a roman numeral, convert it to an integer.",
    ],
    constraints: [
      "1 <= s.length <= 15",
      "s contains only the characters ('I', 'V', 'X', 'L', 'C', 'D', 'M').",
      "It is guaranteed that s is a valid roman numeral in the range [1, 3999].",
    ],
    functionName: "romanToInt",
    signature: [["s", "string"]],
    returns: "number",
    reference: `function romanToInt(s) {
  const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = v[s[i]];
    const next = v[s[i + 1]] || 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}`,
    examples: [
      [["III"], 3, "III = 3."],
      [["LVIII"], 58, "L = 50, V = 5, III = 3."],
      [["MCMXCIV"], 1994, "M = 1000, CM = 900, XC = 90 and IV = 4."],
    ],
    hidden: [["IV"], ["IX"], ["XL"], ["CDXLIV"], ["MMMCMXCIX"], ["I"]],
  },
  {
    id: 20,
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    acceptance: 42.3,
    description: [
      "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.",
      "An input string is valid if: open brackets are closed by the same type of bracket, open brackets are closed in the correct order, and every close bracket has a corresponding open bracket of the same type.",
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    hints: ["Use a stack: push opening brackets, and when you see a closing bracket check it matches the top."],
    functionName: "isValid",
    signature: [["s", "string"]],
    returns: "boolean",
    reference: `function isValid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
    examples: [
      [["()"], true],
      [["()[]{}"], true],
      [["(]"], false],
    ],
    hidden: [["([)]"], ["{[]}"], ["(("], ["]"], ["(((((((((())))))))))"], ["){"], ["(".repeat(5000) + ")".repeat(5000)]],
  },
  {
    id: 70,
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["Math", "Dynamic Programming"],
    acceptance: 53.0,
    description: [
      "You are climbing a staircase. It takes `n` steps to reach the top.",
      "Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    ],
    constraints: ["1 <= n <= 45"],
    hints: ["The number of ways to reach step `n` is the ways to reach `n - 1` plus the ways to reach `n - 2`."],
    functionName: "climbStairs",
    signature: [["n", "number"]],
    returns: "number",
    reference: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
    examples: [
      [[2], 2, "There are two ways to climb to the top: 1 step + 1 step, or 2 steps."],
      [[3], 3, "There are three ways: 1+1+1, 1+2, or 2+1."],
      [[4], 5],
    ],
    hidden: [[1], [5], [10], [30], [45]],
  },
  {
    id: 121,
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    acceptance: 54.5,
    description: [
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.",
      "You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell it.",
      "Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    hints: ["Track the lowest price seen so far and the best profit if you sold today."],
    functionName: "maxProfit",
    signature: [["prices", "number[]"]],
    returns: "number",
    reference: `function maxProfit(prices) {
  let min = Infinity, best = 0;
  for (const p of prices) {
    if (p < min) min = p;
    else if (p - min > best) best = p - min;
  }
  return best;
}`,
    examples: [
      [[[7, 1, 5, 3, 6, 4]], 5, "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."],
      [[[7, 6, 4, 3, 1]], 0, "In this case, no transactions are done and the max profit = 0."],
      [[[2, 4, 1]], 2],
    ],
    hidden: [[[1]], [[1, 2]], [[3, 2, 6, 5, 0, 3]], [[2, 1, 2, 0, 1]], [distinct]],
  },
  {
    id: 136,
    slug: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    tags: ["Array", "Bit Manipulation"],
    acceptance: 71.6,
    description: [
      "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.",
      "You must implement a solution with linear runtime complexity and use only constant extra space.",
    ],
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-3 * 10^4 <= nums[i] <= 3 * 10^4",
      "Each element in the array appears twice except for one element which appears only once.",
    ],
    hints: ["XOR of a number with itself is 0, and XOR with 0 leaves a number unchanged."],
    functionName: "singleNumber",
    signature: [["nums", "number[]"]],
    returns: "number",
    reference: `function singleNumber(nums) {
  let r = 0;
  for (const n of nums) r ^= n;
  return r;
}`,
    examples: [
      [[[2, 2, 1]], 1],
      [[[4, 1, 2, 1, 2]], 4],
      [[[1]], 1],
    ],
    hidden: [[[-1, -1, -2]], [[7, 3, 5, 3, 5]], [[0, 9, 0]], [[30000, -30000, 30000]]],
  },
  {
    id: 217,
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    tags: ["Array", "Hash Table", "Sorting"],
    acceptance: 62.4,
    description: [
      "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    hints: ["A hash set gives you O(1) membership checks."],
    functionName: "containsDuplicate",
    signature: [["nums", "number[]"]],
    returns: "boolean",
    reference: `function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}`,
    examples: [
      [[[1, 2, 3, 1]], true, "The element 1 occurs at indices 0 and 3."],
      [[[1, 2, 3, 4]], false, "All elements are distinct."],
      [[[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], true],
    ],
    hidden: [[[1]], [[0, 0]], [[-1, 5, -1]], [distinct], [[...distinct, 49_999]]],
  },
  {
    id: 242,
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    tags: ["Hash Table", "String", "Sorting"],
    acceptance: 66.0,
    description: [
      "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
      "An anagram is a word formed by rearranging the letters of a different word, using all the original letters exactly once.",
    ],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    functionName: "isAnagram",
    signature: [
      ["s", "string"],
      ["t", "string"],
    ],
    returns: "boolean",
    reference: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = {};
  for (const c of s) counts[c] = (counts[c] || 0) + 1;
  for (const c of t) {
    if (!counts[c]) return false;
    counts[c]--;
  }
  return true;
}`,
    examples: [
      [["anagram", "nagaram"], true],
      [["rat", "car"], false],
      [["listen", "silent"], true],
    ],
    hidden: [["a", "a"], ["ab", "a"], ["aacc", "ccac"], ["abcdefghij".repeat(100), "jihgfedcba".repeat(100)]],
  },
  {
    id: 268,
    slug: "missing-number",
    title: "Missing Number",
    difficulty: "Easy",
    tags: ["Array", "Math", "Bit Manipulation"],
    acceptance: 66.4,
    description: [
      "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
    ],
    constraints: [
      "n == nums.length",
      "1 <= n <= 10^4",
      "0 <= nums[i] <= n",
      "All the numbers of nums are unique.",
    ],
    hints: ["The sum of 0..n is n * (n + 1) / 2."],
    functionName: "missingNumber",
    signature: [["nums", "number[]"]],
    returns: "number",
    reference: `function missingNumber(nums) {
  const n = nums.length;
  let sum = (n * (n + 1)) / 2;
  for (const x of nums) sum -= x;
  return sum;
}`,
    examples: [
      [[[3, 0, 1]], 2, "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number."],
      [[[0, 1]], 2],
      [[[9, 6, 4, 2, 3, 5, 7, 0, 1]], 8],
    ],
    hidden: [[[0]], [[1]], [[1, 2, 3]], [Array.from({ length: 9_999 }, (_, i) => i + 1)]],
  },
  {
    id: 283,
    slug: "move-zeroes",
    title: "Move Zeroes",
    difficulty: "Easy",
    tags: ["Array", "Two Pointers"],
    acceptance: 62.1,
    description: [
      "Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements.",
      "Note that you must do this **in-place** without making a copy of the array. Modify `nums` directly; there is no need to return anything.",
    ],
    constraints: ["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
    hints: ["Keep a write pointer for the next non-zero slot."],
    functionName: "moveZeroes",
    signature: [["nums", "number[]"]],
    returns: "void",
    inPlace: true,
    reference: `function moveZeroes(nums) {
  let w = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) nums[w++] = nums[i];
  }
  while (w < nums.length) nums[w++] = 0;
}`,
    examples: [
      [[[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]],
      [[[0]], [0]],
      [[[1, 0]], [1, 0]],
    ],
    hidden: [[[0, 0, 1]], [[1, 2, 3]], [[0, 0, 0]], [[4, 0, 5, 0, 0, 6, 0, 7]]],
  },
  {
    id: 344,
    slug: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    tags: ["Two Pointers", "String"],
    acceptance: 79.7,
    description: [
      "Write a function that reverses a string. The input string is given as an array of characters `s`.",
      "You must do this by modifying the input array **in-place** with O(1) extra memory. There is no need to return anything.",
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    functionName: "reverseString",
    signature: [["s", "string[]"]],
    returns: "void",
    inPlace: true,
    reference: `function reverseString(s) {
  let l = 0, r = s.length - 1;
  while (l < r) {
    [s[l], s[r]] = [s[r], s[l]];
    l++; r--;
  }
}`,
    examples: [
      [[["h", "e", "l", "l", "o"]], ["o", "l", "l", "e", "h"]],
      [[["H", "a", "n", "n", "a", "h"]], ["h", "a", "n", "n", "a", "H"]],
      [[["a", "b"]], ["b", "a"]],
    ],
    hidden: [[["a"]], [["a", "b", "c"]], [Array.from({ length: 20_000 }, (_, i) => String.fromCharCode(97 + (i % 26)))]],
  },
  {
    id: 412,
    slug: "fizz-buzz",
    title: "Fizz Buzz",
    difficulty: "Easy",
    tags: ["Math", "String", "Simulation"],
    acceptance: 74.1,
    description: [
      "Given an integer `n`, return a string array `answer` (1-indexed) where:",
      "`answer[i] == \"FizzBuzz\"` if `i` is divisible by 3 and 5; `answer[i] == \"Fizz\"` if `i` is divisible by 3; `answer[i] == \"Buzz\"` if `i` is divisible by 5; and `answer[i] == i` (as a string) otherwise.",
    ],
    constraints: ["1 <= n <= 10^4"],
    functionName: "fizzBuzz",
    signature: [["n", "number"]],
    returns: "string[]",
    reference: `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : String(i));
  }
  return out;
}`,
    examples: [
      [[3], ["1", "2", "Fizz"]],
      [[5], ["1", "2", "Fizz", "4", "Buzz"]],
      [
        [15],
        ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"],
      ],
    ],
    hidden: [[1], [2], [30], [10_000]],
  },
  {
    id: 704,
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    acceptance: 58.0,
    description: [
      "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return `-1`.",
      "You must write an algorithm with `O(log n)` runtime complexity.",
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    functionName: "search",
    signature: [
      ["nums", "number[]"],
      ["target", "number"],
    ],
    returns: "number",
    reference: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    examples: [
      [[[-1, 0, 3, 5, 9, 12], 9], 4, "9 exists in nums and its index is 4."],
      [[[-1, 0, 3, 5, 9, 12], 2], -1, "2 does not exist in nums so return -1."],
      [[[5], 5], 0],
    ],
    hidden: [
      [[5], -5],
      [[1, 3, 5, 7, 9, 11], 11],
      [[1, 3, 5, 7, 9, 11], 1],
      [[1, 3, 5, 7, 9, 11], 6],
      [Array.from({ length: 9_999 }, (_, i) => i * 2 - 9_999), 8_001],
    ],
  },
];

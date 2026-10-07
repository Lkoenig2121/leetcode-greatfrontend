import type { ProblemDef } from "./types";

export const hardProblems: ProblemDef[] = [
  {
    id: 4,
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    acceptance: 43.8,
    description: [
      "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.",
      "The overall run time complexity should be `O(log (m+n))`.",
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
    hints: ["Binary search the partition point in the shorter array."],
    functionName: "findMedianSortedArrays",
    signature: [
      ["nums1", "number[]"],
      ["nums2", "number[]"],
    ],
    returns: "number",
    reference: `function findMedianSortedArrays(nums1, nums2) {
  const merged = [];
  let i = 0, j = 0;
  while (i < nums1.length || j < nums2.length) {
    if (j >= nums2.length || (i < nums1.length && nums1[i] <= nums2[j])) merged.push(nums1[i++]);
    else merged.push(nums2[j++]);
  }
  const mid = merged.length >> 1;
  return merged.length % 2 ? merged[mid] : (merged[mid - 1] + merged[mid]) / 2;
}`,
    examples: [
      [[[1, 3], [2]], 2, "merged array = [1,2,3] and median is 2."],
      [[[1, 2], [3, 4]], 2.5, "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."],
      [[[0, 0], [0, 0]], 0],
    ],
    hidden: [
      [[], [1]],
      [[2], []],
      [[1, 2, 3, 4, 5], [6, 7, 8]],
      [[-5, 3, 6, 12, 15], [-12, -10, -6, -3, 4, 10]],
      [
        Array.from({ length: 1_000 }, (_, i) => i * 2),
        Array.from({ length: 1_000 }, (_, i) => i * 2 + 1),
      ],
    ],
  },
  {
    id: 32,
    slug: "longest-valid-parentheses",
    title: "Longest Valid Parentheses",
    difficulty: "Hard",
    tags: ["String", "Dynamic Programming", "Stack"],
    acceptance: 34.5,
    description: [
      "Given a string containing just the characters `'('` and `')'`, return the length of the longest valid (well-formed) parentheses substring.",
    ],
    constraints: ["0 <= s.length <= 3 * 10^4", "s[i] is '(' or ')'."],
    hints: ["A stack of indices lets you measure the length of each valid run when you match a pair."],
    functionName: "longestValidParentheses",
    signature: [["s", "string"]],
    returns: "number",
    reference: `function longestValidParentheses(s) {
  const stack = [-1];
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") stack.push(i);
    else {
      stack.pop();
      if (stack.length === 0) stack.push(i);
      else best = Math.max(best, i - stack[stack.length - 1]);
    }
  }
  return best;
}`,
    examples: [
      [["(()"], 2, 'The longest valid parentheses substring is "()".'],
      [[")()())"], 4, 'The longest valid parentheses substring is "()()".'],
      [[""], 0],
    ],
    hidden: [
      ["()(()"],
      ["()(())"],
      ["(()(((()"],
      ["(((((("],
      ["()()()"],
      ["()".repeat(15_000)],
      ["(".repeat(15_000) + ")".repeat(15_000)],
    ],
  },
  {
    id: 42,
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    acceptance: 65.1,
    description: [
      "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    ],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    hints: [
      "Water above a bar is min(max height to its left, max height to its right) - its own height.",
      "Two pointers let you compute this in O(n) time and O(1) space.",
    ],
    functionName: "trap",
    signature: [["height", "number[]"]],
    returns: "number",
    reference: `function trap(height) {
  let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l++];
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r--];
    }
  }
  return water;
}`,
    examples: [
      [[[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], 6, "In this elevation map, 6 units of rain water are being trapped."],
      [[[4, 2, 0, 3, 2, 5]], 9],
      [[[3, 0, 2, 0, 4]], 7],
    ],
    hidden: [
      [[3]],
      [[2, 0, 2]],
      [[5, 4, 1, 2]],
      [[1, 2, 3, 4, 5]],
      [Array.from({ length: 20_000 }, (_, i) => (i * 37) % 1_000)],
    ],
  },
];

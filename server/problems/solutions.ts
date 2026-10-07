import type { EditorLanguage } from "../../lib/languages";
import { isEditorLanguage } from "../../lib/languages";
import type { LoadedProblem } from "./types";

type LangSolution = Partial<Record<Exclude<EditorLanguage, "javascript">, string>>;

const SOLUTIONS: Record<string, LangSolution> = {
  "two-sum": {
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, n in enumerate(nums):
            need = target - n
            if need in seen:
                return [seen[need], i]
            seen[n] = i
        return []
`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[] { seen.get(need), i };
            seen.put(nums[i], i);
        }
        return new int[] {};
    }
}
`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) return {seen[need], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
  },
  "palindrome-number": {
    python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0:
            return False
        s = str(x)
        return s == s[::-1]
`,
    java: `class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        String s = Integer.toString(x);
        return s.equals(new StringBuilder(s).reverse().toString());
    }
}
`,
    cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) return false;
        string s = to_string(x);
        string r = s;
        reverse(r.begin(), r.end());
        return s == r;
    }
};
`,
  },
  "roman-to-integer": {
    python: `class Solution:
    def romanToInt(self, s: str) -> int:
        v = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total = 0
        for i, ch in enumerate(s):
            cur = v[ch]
            nxt = v[s[i + 1]] if i + 1 < len(s) else 0
            total += -cur if cur < nxt else cur
        return total
`,
    java: `class Solution {
    public int romanToInt(String s) {
        Map<Character, Integer> v = Map.of('I', 1, 'V', 5, 'X', 10, 'L', 50, 'C', 100, 'D', 500, 'M', 1000);
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int cur = v.get(s.charAt(i));
            int next = i + 1 < s.length() ? v.get(s.charAt(i + 1)) : 0;
            total += cur < next ? -cur : cur;
        }
        return total;
    }
}
`,
    cpp: `class Solution {
public:
    int romanToInt(string s) {
        unordered_map<char, int> v = {{'I',1},{'V',5},{'X',10},{'L',50},{'C',100},{'D',500},{'M',1000}};
        int total = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            int cur = v[s[i]];
            int next = i + 1 < (int)s.size() ? v[s[i + 1]] : 0;
            total += cur < next ? -cur : cur;
        }
        return total;
    }
};
`,
  },
  "valid-parentheses": {
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in pairs:
                if not stack or stack.pop() != pairs[ch]:
                    return False
            else:
                stack.append(ch)
        return not stack
`,
    java: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char ch : s.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') stack.push(ch);
            else {
                if (stack.isEmpty()) return false;
                char open = stack.pop();
                if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{')) return false;
            }
        }
        return stack.isEmpty();
    }
}
`,
    cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char ch : s) {
            if (ch == '(' || ch == '[' || ch == '{') st.push(ch);
            else {
                if (st.empty()) return false;
                char open = st.top(); st.pop();
                if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{')) return false;
            }
        }
        return st.empty();
    }
};
`,
  },
  "climbing-stairs": {
    python: `class Solution:
    def climbStairs(self, n: int) -> int:
        a = b = 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b
`,
    java: `class Solution {
    public int climbStairs(int n) {
        int a = 1, b = 1;
        for (int i = 2; i <= n; i++) {
            int next = a + b;
            a = b;
            b = next;
        }
        return b;
    }
}
`,
    cpp: `class Solution {
public:
    int climbStairs(int n) {
        int a = 1, b = 1;
        for (int i = 2; i <= n; i++) {
            int next = a + b;
            a = b;
            b = next;
        }
        return b;
    }
};
`,
  },
  "best-time-to-buy-and-sell-stock": {
    python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        low, best = float("inf"), 0
        for p in prices:
            if p < low:
                low = p
            elif p - low > best:
                best = p - low
        return int(best)
`,
    java: `class Solution {
    public int maxProfit(int[] prices) {
        int min = Integer.MAX_VALUE, best = 0;
        for (int p : prices) {
            if (p < min) min = p;
            else if (p - min > best) best = p - min;
        }
        return best;
    }
}
`,
    cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int mn = INT_MAX, best = 0;
        for (int p : prices) {
            if (p < mn) mn = p;
            else if (p - mn > best) best = p - mn;
        }
        return best;
    }
};
`,
  },
  "single-number": {
    python: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        r = 0
        for n in nums:
            r ^= n
        return r
`,
    java: `class Solution {
    public int singleNumber(int[] nums) {
        int r = 0;
        for (int n : nums) r ^= n;
        return r;
    }
}
`,
    cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int r = 0;
        for (int n : nums) r ^= n;
        return r;
    }
};
`,
  },
  "contains-duplicate": {
    python: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        return len(set(nums)) != len(nums)
`,
    java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int n : nums) if (!seen.add(n)) return true;
        return false;
    }
}
`,
    cpp: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen(nums.begin(), nums.end());
        return seen.size() != nums.size();
    }
};
`,
  },
  "valid-anagram": {
    python: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        counts: dict[str, int] = {}
        for c in s:
            counts[c] = counts.get(c, 0) + 1
        for c in t:
            if not counts.get(c):
                return False
            counts[c] -= 1
        return True
`,
    java: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (int i = 0; i < s.length(); i++) {
            counts[s.charAt(i) - 'a']++;
            counts[t.charAt(i) - 'a']--;
        }
        for (int c : counts) if (c != 0) return false;
        return true;
    }
}
`,
    cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int counts[26] = {};
        for (int i = 0; i < (int)s.size(); i++) {
            counts[s[i] - 'a']++;
            counts[t[i] - 'a']--;
        }
        for (int c : counts) if (c) return false;
        return true;
    }
};
`,
  },
  "missing-number": {
    python: `class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        n = len(nums)
        total = n * (n + 1) // 2
        return total - sum(nums)
`,
    java: `class Solution {
    public int missingNumber(int[] nums) {
        int n = nums.length;
        int sum = n * (n + 1) / 2;
        for (int x : nums) sum -= x;
        return sum;
    }
}
`,
    cpp: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = (int)nums.size();
        int sum = n * (n + 1) / 2;
        for (int x : nums) sum -= x;
        return sum;
    }
};
`,
  },
  "move-zeroes": {
    python: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        w = 0
        for n in nums:
            if n != 0:
                nums[w] = n
                w += 1
        while w < len(nums):
            nums[w] = 0
            w += 1
`,
    java: `class Solution {
    public void moveZeroes(int[] nums) {
        int w = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) nums[w++] = nums[i];
        }
        while (w < nums.length) nums[w++] = 0;
    }
}
`,
    cpp: `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int w = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (nums[i] != 0) nums[w++] = nums[i];
        }
        while (w < (int)nums.size()) nums[w++] = 0;
    }
};
`,
  },
  "reverse-string": {
    python: `class Solution:
    def reverseString(self, s: list[str]) -> None:
        l, r = 0, len(s) - 1
        while l < r:
            s[l], s[r] = s[r], s[l]
            l += 1
            r -= 1
`,
    java: `class Solution {
    public void reverseString(char[] s) {
        int l = 0, r = s.length - 1;
        while (l < r) {
            char tmp = s[l];
            s[l++] = s[r];
            s[r--] = tmp;
        }
    }
}
`,
    cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        int l = 0, r = (int)s.size() - 1;
        while (l < r) swap(s[l++], s[r--]);
    }
};
`,
  },
  "fizz-buzz": {
    python: `class Solution:
    def fizzBuzz(self, n: int) -> list[str]:
        out = []
        for i in range(1, n + 1):
            if i % 15 == 0:
                out.append("FizzBuzz")
            elif i % 3 == 0:
                out.append("Fizz")
            elif i % 5 == 0:
                out.append("Buzz")
            else:
                out.append(str(i))
        return out
`,
    java: `class Solution {
    public List<String> fizzBuzz(int n) {
        List<String> out = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) out.add("FizzBuzz");
            else if (i % 3 == 0) out.add("Fizz");
            else if (i % 5 == 0) out.add("Buzz");
            else out.add(Integer.toString(i));
        }
        return out;
    }
}
`,
    cpp: `class Solution {
public:
    vector<string> fizzBuzz(int n) {
        vector<string> out;
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) out.push_back("FizzBuzz");
            else if (i % 3 == 0) out.push_back("Fizz");
            else if (i % 5 == 0) out.push_back("Buzz");
            else out.push_back(to_string(i));
        }
        return out;
    }
};
`,
  },
  "binary-search": {
    python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1
`,
    java: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
}
`,
    cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
};
`,
  },
  "longest-substring-without-repeating-characters": {
    python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        left = best = 0
        for right, ch in enumerate(s):
            if ch in last and last[ch] >= left:
                left = last[ch] + 1
            last[ch] = right
            best = max(best, right - left + 1)
        return best
`,
    java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            if (last.containsKey(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
            last.put(ch, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
`,
    cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int left = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            char ch = s[right];
            if (last.count(ch) && last[ch] >= left) left = last[ch] + 1;
            last[ch] = right;
            best = max(best, right - left + 1);
        }
        return best;
    }
};
`,
  },
  "container-with-most-water": {
    python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        l, r, best = 0, len(height) - 1, 0
        while l < r:
            best = max(best, min(height[l], height[r]) * (r - l))
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return best
`,
    java: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, best = 0;
        while (l < r) {
            best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return best;
    }
}
`,
    cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = (int)height.size() - 1, best = 0;
        while (l < r) {
            best = max(best, min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return best;
    }
};
`,
  },
  "3sum": {
    python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        a = sorted(nums)
        res = []
        for i in range(len(a) - 2):
            if a[i] > 0:
                break
            if i > 0 and a[i] == a[i - 1]:
                continue
            l, r = i + 1, len(a) - 1
            while l < r:
                s = a[i] + a[l] + a[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    res.append([a[i], a[l], a[r]])
                    while l < r and a[l] == a[l + 1]:
                        l += 1
                    while l < r and a[r] == a[r - 1]:
                        r -= 1
                    l += 1
                    r -= 1
        return res
`,
    java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum < 0) l++;
                else if (sum > 0) r--;
                else {
                    res.add(List.of(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
        return res;
    }
}
`,
    cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i < (int)nums.size() - 2; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = (int)nums.size() - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum < 0) l++;
                else if (sum > 0) r--;
                else {
                    res.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
        return res;
    }
};
`,
  },
  "group-anagrams": {
    python: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups: dict[str, list[str]] = {}
        for s in strs:
            key = "".join(sorted(s))
            groups.setdefault(key, []).append(s)
        return list(groups.values())
`,
    java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(groups.values());
    }
}
`,
    cpp: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (auto& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }
        vector<vector<string>> out;
        for (auto& [_, v] : groups) out.push_back(v);
        return out;
    }
};
`,
  },
  "maximum-subarray": {
    python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        cur = best = nums[0]
        for n in nums[1:]:
            cur = max(n, cur + n)
            best = max(best, cur)
        return best
`,
    java: `class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }
}
`,
    cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};
`,
  },
  "merge-intervals": {
    python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda iv: iv[0])
        out = []
        for iv in intervals:
            if out and iv[0] <= out[-1][1]:
                out[-1][1] = max(out[-1][1], iv[1])
            else:
                out.append(iv[:])
        return out
`,
    java: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] iv : intervals) {
            if (!out.isEmpty() && iv[0] <= out.get(out.size() - 1)[1]) {
                out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], iv[1]);
            } else out.add(iv.clone());
        }
        return out.toArray(new int[0][]);
    }
}
`,
    cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> out;
        for (auto& iv : intervals) {
            if (!out.empty() && iv[0] <= out.back()[1]) out.back()[1] = max(out.back()[1], iv[1]);
            else out.push_back(iv);
        }
        return out;
    }
};
`,
  },
  "product-of-array-except-self": {
    python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        out = [1] * n
        prefix = 1
        for i in range(n):
            out[i] = prefix
            prefix *= nums[i]
        suffix = 1
        for i in range(n - 1, -1, -1):
            out[i] *= suffix
            suffix *= nums[i]
        return out
`,
    java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int prefix = 1;
        for (int i = 0; i < n; i++) { out[i] = prefix; prefix *= nums[i]; }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) { out[i] *= suffix; suffix *= nums[i]; }
        return out;
    }
}
`,
    cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> out(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) { out[i] = prefix; prefix *= nums[i]; }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) { out[i] *= suffix; suffix *= nums[i]; }
        return out;
    }
};
`,
  },
  "median-of-two-sorted-arrays": {
    python: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        merged = []
        i = j = 0
        while i < len(nums1) or j < len(nums2):
            if j >= len(nums2) or (i < len(nums1) and nums1[i] <= nums2[j]):
                merged.append(nums1[i])
                i += 1
            else:
                merged.append(nums2[j])
                j += 1
        mid = len(merged) // 2
        if len(merged) % 2:
            return float(merged[mid])
        return (merged[mid - 1] + merged[mid]) / 2
`,
    java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] merged = new int[nums1.length + nums2.length];
        int i = 0, j = 0, k = 0;
        while (i < nums1.length || j < nums2.length) {
            if (j >= nums2.length || (i < nums1.length && nums1[i] <= nums2[j])) merged[k++] = nums1[i++];
            else merged[k++] = nums2[j++];
        }
        int mid = merged.length / 2;
        if (merged.length % 2 == 1) return merged[mid];
        return (merged[mid - 1] + merged[mid]) / 2.0;
    }
}
`,
    cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> merged;
        int i = 0, j = 0;
        while (i < (int)nums1.size() || j < (int)nums2.size()) {
            if (j >= (int)nums2.size() || (i < (int)nums1.size() && nums1[i] <= nums2[j])) merged.push_back(nums1[i++]);
            else merged.push_back(nums2[j++]);
        }
        int mid = (int)merged.size() / 2;
        if (merged.size() % 2) return merged[mid];
        return (merged[mid - 1] + merged[mid]) / 2.0;
    }
};
`,
  },
  "longest-valid-parentheses": {
    python: `class Solution:
    def longestValidParentheses(self, s: str) -> int:
        stack = [-1]
        best = 0
        for i, ch in enumerate(s):
            if ch == "(":
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    best = max(best, i - stack[-1])
        return best
`,
    java: `class Solution {
    public int longestValidParentheses(String s) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(-1);
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') stack.push(i);
            else {
                stack.pop();
                if (stack.isEmpty()) stack.push(i);
                else best = Math.max(best, i - stack.peek());
            }
        }
        return best;
    }
}
`,
    cpp: `class Solution {
public:
    int longestValidParentheses(string s) {
        stack<int> st;
        st.push(-1);
        int best = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            if (s[i] == '(') st.push(i);
            else {
                st.pop();
                if (st.empty()) st.push(i);
                else best = max(best, i - st.top());
            }
        }
        return best;
    }
};
`,
  },
  "trapping-rain-water": {
    python: `class Solution:
    def trap(self, height: list[int]) -> int:
        l, r = 0, len(height) - 1
        left_max = right_max = water = 0
        while l < r:
            if height[l] < height[r]:
                left_max = max(left_max, height[l])
                water += left_max - height[l]
                l += 1
            else:
                right_max = max(right_max, height[r])
                water += right_max - height[r]
                r -= 1
        return water
`,
    java: `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
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
    }
}
`,
    cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = (int)height.size() - 1, leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                leftMax = max(leftMax, height[l]);
                water += leftMax - height[l++];
            } else {
                rightMax = max(rightMax, height[r]);
                water += rightMax - height[r--];
            }
        }
        return water;
    }
};
`,
  },
};

export function solutionFor(problem: LoadedProblem, language: EditorLanguage): string | null {
  if (language === "javascript") return problem.reference;
  return SOLUTIONS[problem.slug]?.[language] ?? null;
}

export function parseLanguage(raw: unknown): EditorLanguage | null {
  if (typeof raw !== "string") return null;
  return isEditorLanguage(raw) ? raw : null;
}

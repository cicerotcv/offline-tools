import trieData from '../../domain/mnemonic/trie-precomputed.json';
import { BIP39_WORDS } from '../../domain/mnemonic/wordlist';

interface TrieNode {
  indices: number[];
  isEndOfWord: boolean;
  children: Record<string, TrieNode>;
}

/**
 * Searches the BIP39 trie for words that match the given prefix
 * @param prefix - The prefix to search for
 * @param maxResults - Maximum number of results to return (default: 10)
 * @returns Array of word suggestions matching the prefix
 */
export function getAutocompleteSuggestions(
  prefix: string,
  maxResults: number = 10
): string[] {
  if (!prefix || prefix.trim().length === 0) {
    return [];
  }

  const normalizedPrefix = prefix.toLowerCase().trim();
  const trie = trieData as TrieNode;

  // Navigate to the node corresponding to the prefix
  let currentNode: TrieNode | undefined = trie;
  for (const char of normalizedPrefix) {
    if (!currentNode.children[char]) {
      // No words match this prefix
      return [];
    }
    currentNode = currentNode.children[char];
  }

  // Collect all word indices from this node and its descendants
  const wordIndices = new Set<number>();

  // Recursively collect all indices from this node and its children
  function collectIndices(node: TrieNode) {
    // Add all indices from current node
    node.indices.forEach((idx) => wordIndices.add(idx));

    // Recursively collect from all children
    Object.values(node.children).forEach((child) => {
      collectIndices(child);
    });
  }

  // Start collecting from current node
  collectIndices(currentNode);

  // Convert indices to words, filter by prefix, and limit results
  const suggestions = Array.from(wordIndices)
    .map((idx) => BIP39_WORDS[idx])
    .filter((word) => word.startsWith(normalizedPrefix))
    .slice(0, maxResults)
    .sort();

  return suggestions;
}

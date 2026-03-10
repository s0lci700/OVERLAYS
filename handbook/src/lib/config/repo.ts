/** Centralized GitHub repository configuration for the handbook. */
export const REPO_OWNER = 's0lci700';
export const REPO_NAME = 'OVERLAYS';
export const REPO_DEFAULT_BRANCH = 'main';

const REPO_ROOT = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

/** URL pointing to a file (blob) in the repo. */
export function repoFileUrl(path: string, branch = REPO_DEFAULT_BRANCH): string {
	return `${REPO_ROOT}/blob/${branch}/${path}`;
}

/** URL pointing to a directory (tree) in the repo. */
export function repoDirUrl(path: string, branch = REPO_DEFAULT_BRANCH): string {
	return `${REPO_ROOT}/tree/${branch}/${path}`;
}

/** URL pointing to a file or directory in the repo. */
export function repoEntryUrl(
	path: string,
	type: 'file' | 'dir',
	branch = REPO_DEFAULT_BRANCH
): string {
	return type === 'dir' ? repoDirUrl(path, branch) : repoFileUrl(path, branch);
}

import { browser } from '$app/environment';
import type { ProgressStatus } from '$lib/types/content';

const STORAGE_KEY = 'handbook-progress';

interface PersistedState {
	topics: Record<string, ProgressStatus>;
	currentTopic: string | null;
	lastStudied: string | null;
}

function loadFromStorage(): PersistedState {
	if (!browser) return { topics: {}, currentTopic: null, lastStudied: null };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : { topics: {}, currentTopic: null, lastStudied: null };
	} catch {
		return { topics: {}, currentTopic: null, lastStudied: null };
	}
}

const initial = loadFromStorage();

let topics = $state<Record<string, ProgressStatus>>(initial.topics);
let currentTopic = $state<string | null>(initial.currentTopic);
let lastStudied = $state<string | null>(initial.lastStudied);

function persist() {
	if (!browser) return;
	const state: PersistedState = {
		topics: { ...topics },
		currentTopic,
		lastStudied
	};
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (err) {
		console.warn('[handbook] Progress could not be persisted:', err);
	}
}

function getStatus(slug: string): ProgressStatus {
	return topics[slug] ?? 'not-started';
}

function setStatus(slug: string, status: ProgressStatus) {
	topics[slug] = status;
	lastStudied = slug;
	persist();
}

function setCurrentTopic(slug: string) {
	currentTopic = slug;
	if (!topics[slug] || topics[slug] === 'not-started') {
		topics[slug] = 'in-progress';
	}
	lastStudied = slug;
	persist();
}

function reset() {
	topics = {};
	currentTopic = null;
	lastStudied = null;
	if (browser) localStorage.removeItem(STORAGE_KEY);
}

export const progress = {
	get topics() {
		return topics;
	},
	get currentTopic() {
		return currentTopic;
	},
	get lastStudied() {
		return lastStudied;
	},
	getStatus,
	setStatus,
	setCurrentTopic,
	reset
};

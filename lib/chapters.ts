import { prisma } from "@/lib/prisma";

type StoryNode = {
  type?: string;
  text?: string;
  content?: StoryNode[];
};

/**
 * Builds a short, text-only preview doc from rich chapter content
 * (no images, first `limit` text blocks). Safe to send to anyone.
 */
export function buildPreviewContent(content: any, limit = 14) {
  const blocks: StoryNode[] = [];

  for (const node of (content?.content || []) as StoryNode[]) {
    if (
      node.type === "paragraph" ||
      node.type === "heading" ||
      node.type === "blockquote"
    ) {
      blocks.push(node);
    }

    if (blocks.length >= limit) break;
  }

  return { type: "doc", content: blocks };
}

/**
 * Everything needed to decide which chapters of a story a user can read.
 */
export async function getReaderAccess(
  storyId: string,
  userId: string | null
) {
  if (!userId) {
    return {
      ownsStory: false,
      unlockedIds: new Set<string>(),
      coins: 0,
    };
  }

  const [storyPurchase, unlocks, user] = await Promise.all([
    prisma.storyPurchase.findUnique({
      where: { userId_storyId: { userId, storyId } },
      select: { id: true },
    }),
    prisma.chapterUnlock.findMany({
      where: { userId, chapter: { storyId } },
      select: { chapterId: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    }),
  ]);

  return {
    // Readers who bought the whole book before chapters existed keep full access.
    ownsStory: Boolean(storyPurchase),
    unlockedIds: new Set(unlocks.map((u) => u.chapterId)),
    coins: user?.coins ?? 0,
  };
}

export function canReadChapter(
  chapter: { id: string; isFree: boolean; price: number },
  access: { ownsStory: boolean; unlockedIds: Set<string> },
  isAdmin: boolean
) {
  return (
    isAdmin ||
    chapter.isFree ||
    chapter.price <= 0 ||
    access.ownsStory ||
    access.unlockedIds.has(chapter.id)
  );
}

/**
 * Renumbers a story's chapters 1..n, keeping their current order.
 */
export async function renumberChapters(storyId: string) {
  const chapters = await prisma.chapter.findMany({
    where: { storyId },
    orderBy: [{ number: "asc" }, { createdAt: "asc" }],
    select: { id: true, number: true },
  });

  await prisma.$transaction(
    chapters
      .map((chapter, index) => ({ ...chapter, next: index + 1 }))
      .filter((chapter) => chapter.number !== chapter.next)
      .map((chapter) =>
        prisma.chapter.update({
          where: { id: chapter.id },
          data: { number: chapter.next },
        })
      )
  );
}

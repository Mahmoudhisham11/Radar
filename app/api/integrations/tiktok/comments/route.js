import { NextResponse } from "next/server";
import { commentRepository } from "@/lib/repositories/commentRepository";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const comments = await commentRepository.listComments();
    const unrepliedCount = comments.filter((c) => !c.replied).length;
    return NextResponse.json({ comments, unrepliedCount });
  } catch (error) {
    logger.error("Error retrieving comments", error);
    return NextResponse.json(
      { comments: [], unrepliedCount: 0, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { commentId, action, text, authorName, videoId, videoTitle } = body;

    // Handle adding a new comment
    if (action === "add" || (text && !action)) {
      const newComment = await commentRepository.addComment({
        text,
        authorName: authorName || "عميل محتمل",
        videoId,
        videoTitle: videoTitle || "فيديو تيك توك",
      });
      const allComments = await commentRepository.listComments();
      const unrepliedCount = allComments.filter((c) => !c.replied).length;
      return NextResponse.json({ success: true, comment: newComment, unrepliedCount });
    }

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId is required for this action" },
        { status: 400 }
      );
    }

    if (action === "reply" || action === "mark_replied") {
      const updated = await commentRepository.markAsReplied(commentId);
      const allComments = await commentRepository.listComments();
      const unrepliedCount = allComments.filter((c) => !c.replied).length;
      return NextResponse.json({ success: true, comment: updated, unrepliedCount });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    logger.error("Error handling comment action", error);
    return NextResponse.json(
      { error: error.message || "Failed to process comment action" },
      { status: 500 }
    );
  }
}

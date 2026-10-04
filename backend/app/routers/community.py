"""Community Hub router – posts, comments, likes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.post import Post, Comment
from app.schemas.post import PostCreate, CommentCreate, PostResponse, CommentResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/community", tags=["Community"])


@router.post("/posts", response_model=PostResponse, status_code=201)
def create_post(
    payload: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new community post."""
    post = Post(user_id=current_user.id, content=payload.content)
    db.add(post)
    db.commit()
    db.refresh(post)

    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        username=current_user.username,
        content=post.content,
        likes_count=post.likes_count,
        comments_count=post.comments_count,
        is_moderated=post.is_moderated,
        comments=[],
        created_at=post.created_at,
    )


@router.get("/posts", response_model=list[PostResponse])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List community posts (newest first). Public endpoint."""
    posts = (
        db.query(Post)
        .filter(Post.is_moderated == False)
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        comments = db.query(Comment).filter(Comment.post_id == post.id).all()
        comment_responses = []
        for c in comments:
            c_user = db.query(User).filter(User.id == c.user_id).first()
            comment_responses.append(CommentResponse(
                id=c.id,
                user_id=c.user_id,
                username=c_user.username if c_user else "Unknown",
                content=c.content,
                created_at=c.created_at,
            ))
        results.append(PostResponse(
            id=post.id,
            user_id=post.user_id,
            username=user.username if user else "Unknown",
            content=post.content,
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            is_moderated=post.is_moderated,
            comments=comment_responses,
            created_at=post.created_at,
        ))
    return results


@router.post("/posts/{post_id}/like", response_model=PostResponse)
def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Like a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.likes_count += 1
    db.commit()
    db.refresh(post)

    user = db.query(User).filter(User.id == post.user_id).first()
    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        username=user.username if user else "Unknown",
        content=post.content,
        likes_count=post.likes_count,
        comments_count=post.comments_count,
        is_moderated=post.is_moderated,
        comments=[],
        created_at=post.created_at,
    )


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=201)
def add_comment(
    post_id: str,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a comment to a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=payload.content,
    )
    db.add(comment)
    post.comments_count += 1
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        user_id=comment.user_id,
        username=current_user.username,
        content=comment.content,
        created_at=comment.created_at,
    )

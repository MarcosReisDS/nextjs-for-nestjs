import ErrorMessage from "../ErrorMessage";
import { PostCoverImage } from "../PostCoverImage";
import { PostSummary } from "../PostSummary";
import { findAllPublicPostsCached, findAllPublicPostsFromApiCached } from "@/lib/post/queries/public";

export async function PostsList() {
    const postRes = await findAllPublicPostsFromApiCached()

    if (!postRes.success) {
        return null;
    }

    const posts = postRes.data;

    if (posts.length <= 1) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 mb-16 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(1).map(post => {
                const postLink = `/post/${post.slug}`;

                return (
                    <div className="flex flex-col gap-4 group" key={post.id}>
                        <PostCoverImage
                            linkProps={{
                                href: postLink
                            }}
                            imageProps={{
                                width: 1200,
                                height: 720,
                                src: post.coverImageUrl,
                                alt: post.title
                            }}
                        />

                        <PostSummary
                            postHeading="h2"
                            postLink={postLink}
                            createdAt={post.createdAt}
                            title={post.title}
                            excerpt={post.excerpt}
                        />
                    </div>
                )
            })}
        </div>
    )
}
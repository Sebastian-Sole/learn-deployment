import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { type RouterOutputs, api } from "~/utils/api";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (postData: PostWithUser) => {
  const { post, author } = postData;
  return (
    <Link href={`/post/${post.id}`}>
      <div className="border-b border-slate-400 p-8">
        <div key={post.id}>{post.content}</div>
        <Link href={`/@${author.username}`}>
          <div>Author: {author?.username}</div>
        </Link>
      </div>
    </Link>
  );
};

export default function Home() {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");

  const { data, isLoading } = api.posts.getAll.useQuery();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setContent("");
      void ctx.invalidate();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  if (!data || isLoading) return <div>Loading...</div>;

  const createPost = () => {
    setIsOpen(true);
  };

  const handleSubmit = () => {
    mutate({ content });
    setIsOpen(false);
  };

  return (
    <>
      <main className="flex h-screen justify-center bg-slate-800  text-slate-50">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex justify-between border-b border-slate-400 p-4">
            {!user.isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {user.isSignedIn && <SignOutButton />}
            <Button variant="white" onClick={createPost}>
              Create
            </Button>
          </div>
          {isOpen && (
            <>
              <div>
                <input
                  type="text"
                  onChange={handleChange}
                  className="text-slate-950"
                  disabled={isPosting}
                />
              </div>
              <Button variant="white" onClick={handleSubmit}>
                Submit
              </Button>
            </>
          )}
          <div>
            {data?.map((postData) => (
              <PostView key={postData.post.id} {...postData} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

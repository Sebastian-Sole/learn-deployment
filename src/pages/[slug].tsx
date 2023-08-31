import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import type { GetStaticProps, NextPage } from "next";

const Profile: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) {
    return <div>Not found</div>;
  }

  const { data: posts } = api.posts.getPostsByUserId.useQuery({
    userId: data?.id,
  });

  return (
    <div>
      <h1>{data.username}</h1>
      <div>
        {posts?.map((post) => (
          <div key={post.id}>{post.content}</div>
        ))}
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("slug is not a string");
  }

  const username = slug.replace("@", "");

  console.log(username);

  await helpers.profile.getUserByUsername.prefetch({
    username,
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Profile;

import Image from "next/image";

import Header from "@/components/common/Header";
import { getUserPublicImages } from "@/lib/Database/actions/image.action";
import { getUserByMongoId } from "@/lib/Database/actions/user.action";
import { Collection } from "@/components/common/Collection";

interface UserProfileParams {
  params: {
    id: string;
  };
  searchParams: {
    page?: string;
  };
}

const UserProfile = async ({ params, searchParams }: UserProfileParams) => {
  const page = Number(searchParams?.page) || 1;
  const userId = params.id;

  const user = await getUserByMongoId(userId);
  const images = await getUserPublicImages({ 
    page, 
    userId,
  });

  if (!user) {
    return (
      <div className="flex-center h-full w-full flex-col">
        <p className="p-16-medium">User not found</p>
      </div>
    );
  }

  return (
    <>
      {/* <Header title={`${user.firstName} ${user.lastName}'s Profile`} /> */}

      <section className="profile">
        <div className="flex items-center gap-4 mb-8">
          {user.photo ? (
            <Image
              src={user.photo}
              alt={`${user.firstName} ${user.lastName}`}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex-center">
              <p className="text-2xl text-gray-600">
                {user.firstName?.[0] || ''}
                {user.lastName?.[0] || ''}
              </p>
            </div>
          )}
          <div>
            <h2 className="h2-bold text-dark-600">{user.firstName} {user.lastName}</h2>
            <p className="p-16-regular text-dark-400">@{user.username}</p>
          </div>
        </div>
      </section>

      <section className="sm:mt-12">
        {/* <h3 className="h3-bold text-dark-600 mb-4">Public Creations</h3> */}
        <Collection
          images={images?.data || []}
          totalPages={images?.totalPages || 0}
          page={page}
        />
      </section>
    </>
  );
};

export default UserProfile; 
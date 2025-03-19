import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import Header from "@/components/common/Header";
import { getUserImagesWithFilter } from "@/lib/Database/actions/image.action";
import { getUserById } from "@/lib/Database/actions/user.action";
import { Collection } from "@/components/common/Collection";
import VisibilityFilter from "@/components/common/VisibilityFilter";

const Profile = async ({ searchParams }: SearchParamProps) => {
  const paramsData = await searchParams;
  const page = Number(paramsData?.page) || 1;
  const visibility = (paramsData?.visibility as string) || 'all';
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const images = await getUserImagesWithFilter({ 
    page, 
    userId: user._id,
    visibility
  });

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
          </div>
        </div>
      </section>

      <section className="sm:mt-12">
        <VisibilityFilter currentVisibility={visibility} />
        <Collection
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;
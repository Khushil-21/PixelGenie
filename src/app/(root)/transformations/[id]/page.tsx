import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getImageSize } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getImageById } from "@/lib/Database/actions/image.action";
import Header from "@/components/common/Header";
import TransformedImage from "@/components/common/TransformedImage";
import { DeleteConfirmation } from "@/components/common/DeleteConfirmation";
import VisibilityToggle from "@/components/common/VisibilityToggle";
import { getUserById } from "@/lib/Database/actions/user.action";
import { getAllTransactions } from "@/lib/Database/actions/transaction.action";

export async function generateStaticParams() {
  const transactions = await getAllTransactions();

  return transactions.map((transaction: TransactionType) => ({
    id: transaction._id,
  }));
}


const ImageDetails = async ({ params }: SearchParamProps) => {
  const { userId } = await auth();
  const { id } = await params;

  const image = await getImageById(id);
  const user = userId ? await getUserById(userId) : null;
  const isOwner = user && image.author._id.toString() === user._id.toString();

  return (
    <>
      <Header title={image.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className=" capitalize text-purple-400">
            {image.transformationType}
          </p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2 ">
              <p className="text-dark-600">Prompt:</p>
              <p className=" capitalize text-purple-400">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Color:</p>
              <p className=" capitalize text-purple-400">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Aspect Ratio:</p>
              <p className=" capitalize text-purple-400">{image.aspectRatio}</p>
            </div>
          </>
        )}

        {isOwner && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Visibility:</p>
              <VisibilityToggle 
                imageId={image._id}
                userId={user._id}
                isPublic={image.isPublic}
              />
            </div>
          </>
        )}

        <>
          <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
          <div className="p-14-medium md:p-16-medium flex gap-2">
            <p className="text-dark-600">Creator:</p>
            <Link href={`/profile/${image.author._id}`} className="flex items-center gap-2">
              {image.author.photo ? (
                <Image 
                  src={image.author.photo}
                  alt={`${image.author.firstName} ${image.author.lastName}`}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex-center">
                  <p className="text-xs text-gray-600">
                    {image.author.firstName?.[0] || ''}
                    {image.author.lastName?.[0] || ''}
                  </p>
                </div>
              )}
              <p className="text-purple-400">
                {image.author.firstName} {image.author.lastName}
              </p>
            </Link>
          </div>
        </>
      </section>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="transformation-grid">
          {/* MEDIA UPLOADER */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>

            <Image
              width={getImageSize(image.transformationType, image, "width")}
              height={getImageSize(image.transformationType, image, "height")}
              src={image.secureURL}
              alt="image"
              className="transformation-original_image"
            />
          </div>

          {/* TRANSFORMED IMAGE */}
          <TransformedImage
            image={image}
            type={image.transformationType}
            title={image.title}
            isTransforming={false}
            transformationConfig={image.config}
            hasDownload={true}
          />
        </div>

        {userId === image.author.clerkId && (
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link href={`/transformations/${image._id}/update`}>
                Update Image
              </Link>
            </Button>

            <DeleteConfirmation imageId={image._id} />
          </div>
        )}
      </section>
    </>
  );
};

export default ImageDetails;
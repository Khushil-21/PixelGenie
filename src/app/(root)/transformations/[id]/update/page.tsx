import { redirect } from "next/navigation";
import { transformationTypes } from "@/constants";
import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/Database/actions/user.action";
import { getImageById } from "@/lib/Database/actions/image.action";
import TransformationForm from "@/components/common/TransformationForm";
import Header from "@/components/common/Header";
import { getAllTransactions } from "@/lib/Database/actions/transaction.action";

export async function generateStaticParams() {
  const transactions = await getAllTransactions();

  return transactions.map((transaction: TransactionType) => ({
    id: transaction._id,
  }));
}

const Page = async ({ params }: SearchParamProps) => {
    const { userId } = await auth();
    const {id} = await params;

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const image = await getImageById(id);

  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;
import Head from "next/head";
import { PhoneClubbook } from "@/components/renderer/PhoneClubbook";

export default function PocketPage() {
  return (
    <>
      <Head>
        <title>OSDC Pocket</title>
        <meta name="description" content="Pocket clubbook for the Open Source Developers Community" />
      </Head>
      <PhoneClubbook mode="embedded" />
    </>
  );
}

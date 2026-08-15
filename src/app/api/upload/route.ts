import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UploadError, uploadImage } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided. Send a file under the 'file' field." }, { status: 400 });
    }

    const url = await uploadImage(file, session.user.id);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong while uploading the image." }, { status: 500 });
  }
}

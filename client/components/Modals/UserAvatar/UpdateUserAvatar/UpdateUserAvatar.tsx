import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";

import { useRequiredUser, useUser } from "../../../../context/user-context";
import { useCurrentUser } from "../../../../hooks/queries/useCurrentUser";
import { fetcher } from "../../../../utils/fetcher";

interface UpdateUserAvatarProps {
  open: boolean;
  onClose: () => void;
  selector: string;
}

export const UpdateUserAvatar: React.FC<UpdateUserAvatarProps> = ({
  open,
  onClose,
  selector,
}) => {
  const { userDispatch } = useUser();
  const user = useRequiredUser();

  const inputRef = useRef<HTMLInputElement>(null);

  // const [fileInputState, setFileInputState] = useState("");
  const [previewSource, setPreviewSource] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [errMsg, setErrMsg] = useState("");

  const { data, refetch: refetchCurrentUser } = useCurrentUser({
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const handleButtonClick = () => {
    if (!inputRef.current) return;

    // 👇️ open file input box on click of other element
    inputRef.current.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreviewSource(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFile = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    if (!cloudName || !apiKey) {
      toast.error("Avatar uploads are unavailable.");
      return;
    }

    try {
      const { timestamp, publicId, signature } = await fetcher<{
        timestamp: number;
        publicId: string;
        signature: string;
      }>("/images/signature");

      const data = new FormData();
      data.append("file", selectedFile);
      data.append("api_key", apiKey);
      data.append("signature", signature);
      data.append("timestamp", timestamp.toString());
      data.append("public_id", publicId);
      data.append("invalidate", "true");
      data.append("overwrite", "true");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
        { method: "POST", body: data }
      );
      if (!response.ok) throw new Error("Cloudinary upload failed.");

      const photo = await response.json();
      await fetcher(`/users/avatar/${user.id}`, {
        method: "POST",
        body: {
          public_id: photo.public_id,
          version: photo.version,
          signature: photo.signature,
          image_url: photo.secure_url,
        },
      });

      await refetchCurrentUser();
      onClose();
      showToastSuccess();
      setPreviewSource("");
      setSelectedFile(null);
    } catch {
      toast.error("Could not update your avatar.");
    }
  };

  const showToastSuccess = () => {
    toast.success("User avatar updated successfully", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  useEffect(() => {
    if (data) {
      userDispatch({ type: "SET_USER", payload: data });
    }
  }, [data, userDispatch]);

  if (!open || typeof document === "undefined") return null;
  const target = document.getElementById(selector);
  if (!target) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed top-0 left-0 bottom-0 right-0 z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, .7)" }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-2/4 left-2/4 container mx-auto w-11/12 md:w-2/3 max-w-lg z-50 p-4"
        style={{
          transform: "translate(-50%, -50%)",
          backgroundColor: "#FFF",
        }}
      >
        <article
          aria-label="File Upload Modal"
          className="relative h-full flex flex-col bg-white  rounded-md"
          // onDrop={() => {}}
          // onDragOver={() => {}}
          // onDragLeave={() => {}}
          // onDragEnter={() => {}}
        >
          <section className="h-full overflow-auto p-8 w-full flex flex-col">
            <header className="border-dashed border-2 border-gray-400 py-12 flex flex-col justify-center items-center">
              {/* <p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
                <span>Drag and drop your</span>&nbsp;
                <span>files anywhere or</span>
              </p> */}
              <input
                onChange={handleFileInputChange}
                id="hidden-input"
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={handleButtonClick}
                id="button"
                className="cursor-pointer rounded px-10 py-3 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none"
              >
                Upload a file
              </button>
            </header>

            <h1 className="pt-8 pb-3 font-semibold sm:text-lg text-gray-900">
              To Upload
            </h1>

            <ul id="gallery" className="flex flex-1 flex-wrap -m-1">
              <li
                id="empty"
                className="h-full w-full text-center flex flex-col items-center justify-center"
              >
                {previewSource ? (
                  <div>
                    <Image
                      height={200}
                      width={200}
                      src={previewSource}
                      alt="Chosen Image Avatar"
                    />

                    <p className="text-sm">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <div>
                    <Image
                      className="mx-auto w-32"
                      height={128}
                      width={110}
                      src="/assets/images/upload-image.png"
                      alt="no data"
                    />
                    <span className="text-small text-gray-500">
                      No file selected
                    </span>
                  </div>
                )}
              </li>
            </ul>
          </section>

          <footer className="flex justify-end px-8 pb-8 pt-4">
            <button
              id="submit"
              onClick={handleSubmitFile}
              disabled={selectedFile === null}
              className={`cursor-pointer rounded px-4 py-1.5 ${
                selectedFile === null
                  ? "opacity-40 cursor-not-allowed"
                  : "opacity-100 hover:bg-brand-green_hover"
              } bg-brand-green text-white focus:shadow-outline focus:outline-none`}
            >
              Upload now
            </button>
            <button
              // onClick={() => showToastSuccess()}
              onClick={() => onClose()}
              id="cancel"
              className="cursor-pointer ml-3 rounded px-4 py-1.5 hover:bg-gray-200 focus:shadow-outline focus:outline-none"
            >
              Cancel
            </button>
          </footer>
        </article>
      </div>
    </>,
    target
  );
};

import Image from "next/image";
import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../../../../context/user-context";
import { User } from "../../../../interfaces/User";
import fetcher from "../../../../utils/fetcher";

import { toast } from "react-toastify";

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
  const { userState, userDispatch } = useContext(UserContext);

  const ref = useRef<any>(null);
  const inputRef = useRef(null) as RefObject<HTMLInputElement>;

  const [mounted, setMounted] = useState(false);

  const [fileInputState, setFileInputState] = useState("");
  const [previewSource, setPreviewSource] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const { data, refetch: refetchCurrentUser } = useQuery(
    ["me"],
    () => fetcher(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/v2`),
    {
      refetchOnWindowFocus: false,
      enabled: false,
      onSuccess: (data: User) => {
        // console.log("Logged in user: ", data);
        userDispatch({ type: "SET_USER", payload: data });
      },
    }
  );

  const handleButtonClick = () => {
    if (!inputRef.current) return;

    // 👇️ open file input box on click of other element
    inputRef.current.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.currentTarget.files) return;

    const file = e.currentTarget.files[0];
    previewFile(file);
    setSelectedFile(file);
    setFileInputState(e.target.value);
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = () => {
      // @TODO: Add the correct type
      setPreviewSource(reader.result as string);
    };
  };

  const handleSubmitFile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = () => {
      uploadImageToCloudinary(userState.user.profile.avatarId);
    };
    reader.onerror = () => {
      console.error("AHHHHHHHH!!");
      setErrMsg("something went wrong!");
    };
  };

  const uploadImageToCloudinary = async (avatarId: string) => {
    try {
      const signatureResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/signature?avatarId=${avatarId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const signatureResponseJSON = await signatureResponse.json();

      const data = new FormData();
      data.append("file", selectedFile as any);
      data.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as any);
      data.append("signature", signatureResponseJSON.signature);
      data.append("timestamp", signatureResponseJSON.timestamp);
      // If the user already has an avatar then we need to tell cloudinary to overwite that image
      if (avatarId) {
        data.append("invalidate", "true");
        data.append("overwrite", "true");
        data.append("public_id", avatarId);
      }
      data.append("folder", "chinwag/avatars");

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      const cloudinaryResponseJSON = await cloudinaryResponse.json();

      // send the image info back to our server
      const photoData = {
        public_id: cloudinaryResponseJSON.public_id,
        version: cloudinaryResponseJSON.version,
        signature: cloudinaryResponseJSON.signature,
        image_url: cloudinaryResponseJSON.secure_url,
      };

      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/avatar/${userState.user.id}`,
        {
          method: "POST",
          body: JSON.stringify(photoData),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // close the modal
      // reset the setFileInputState, setPreviewSource, setSelectedFile
      // display a toast notification stating that their update was successful
      // show their new updated avatar in top left
      refetchCurrentUser();
      onClose();
      showToastSuccess();

      setFileInputState("");
      setPreviewSource("");
      setSelectedFile(null);
    } catch (error) {
      let errorMessage = "Failed to do something exceptional";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.log(errorMessage);
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
    ref.current = document.querySelector(`#${selector}`);
    setMounted(true);
  }, [selector]);

  if (!open) return null;

  return mounted
    ? createPortal(
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
                    className="hidden"
                  />
                  <button
                    onClick={handleButtonClick}
                    id="button"
                    className="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none"
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
                        <img
                          className="mx-auto w-32"
                          src="https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png"
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
                  className="rounded-sm px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none"
                >
                  Upload now
                </button>
                <button
                  // onClick={() => showToastSuccess()}
                  onClick={() => onClose()}
                  id="cancel"
                  className="ml-3 rounded-sm px-3 py-1 hover:bg-gray-300 focus:shadow-outline focus:outline-none"
                >
                  Cancel
                </button>
              </footer>
            </article>
          </div>
        </>,
        ref.current
      )
    : null;
};

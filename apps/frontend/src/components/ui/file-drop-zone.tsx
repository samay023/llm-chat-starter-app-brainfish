import { useDropzone } from "react-dropzone";

type FileTypes = "application/pdf";
interface Base64File {
  name: string;
  type: string;
  size: number;
  content: string; // base64 string
}

interface FileDropZoneProps {
  onFileDrop: (files: Base64File[]) => void;
  children: React.ReactNode;
  fileTypes?: FileTypes[];
  maxFileSizeMB?: number;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileDrop,
  children,
  fileTypes = ["application/pdf"],
  maxFileSizeMB = 5,
}) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      noClick: true,
      noKeyboard: true,
      onDrop: (acceptedFiles) => {
        const readFiles = acceptedFiles.map((file) => {
          return new Promise<Base64File>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              if (typeof result === "string") {
                resolve({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  content: result.split(",")[1], // Get base64 part
                });
              } else {
                reject("Failed to read file");
              }
            };
            reader.onerror = () => {
              reject("Failed to read file");
            };
            reader.readAsDataURL(file);
          });
        });

        Promise.all(readFiles)
          .then((files) => onFileDrop(files))
          .catch((error) => console.error(error));
      },
      accept:
        fileTypes.length > 0
          ? fileTypes.reduce((acc, type) => {
              acc[type] = [];
              return acc;
            }, {} as { [key: string]: string[] })
          : undefined,
      maxSize: maxFileSizeMB ? maxFileSizeMB * 1024 * 1024 : undefined,
      multiple: false,
      maxFiles: 1,
    });

  return (
    <div
      {...getRootProps({
        className: "fixed inset-0",
      })}
    >
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
          {isDragReject ? (
            <p className="text-xl font-semibold text-red-400">
              Ensure only 1 PDF file is uploaded and is less than{" "}
              {maxFileSizeMB}MB
            </p>
          ) : (
            <p className="text-xl font-semibold">📂 Drop your file to upload</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export { FileDropZone };

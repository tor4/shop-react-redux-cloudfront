import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [error, setError] = React.useState<string>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      setError(undefined);
    }
  };

  const removeFile = () => {
    setFile(undefined);
    setError(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);
    if (!file) {
      return;
    }

    const authToken = localStorage.getItem("authorization_token");
    if (!authToken) {
      console.error("No auth token found");
      return;
    }
    try {
      // Get the presigned URL
      const response = await axios({
        method: "GET",
        url,
        headers: {
          Authorization: `Basic ${authToken}`,
        },
        params: {
          fileName: encodeURIComponent(file.name),
        },
      });
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);
      const result = await fetch(response.data.signedUrl, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);
      setFile(undefined);
    } catch (error) {
      console.error("Error uploading file: ", error);

      if (error instanceof Error) {
        setError("Error uploading file: " + error.message);
      } else {
        setError("Error uploading file");
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
      {error && file && (
        <Typography variant="body2" color="error" gutterBottom>
          {error}
        </Typography>
      )}
    </Box>
  );
}

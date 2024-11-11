import "./App.css";
import axios from "axios";
import toast from "react-hot-toast";

function App() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const phone = formData.get("phone");
    console.log("Phone Number:", phone);

    try {
      const { data } = await axios.post(`http://localhost:3000/${phone}`);
      if (data.status === "success") {
        toast.success(data.message);
      }
    } catch (error) {
      const { data } = error.response;
      if (data.status == "fail" || data.status == "error") {
        toast.error(data.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="flex">
        <label htmlFor="phone">Phone Number</label>
        <input type="text" name="phone" placeholder="Enter Phone Number" />
      </div>
      <button type="submit">Send</button>
    </form>
  );
}

export default App;

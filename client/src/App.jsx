import "./App.css";
import axios from "axios";
import toast from "react-hot-toast";

function App() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const phone = formData.get("phone");
    const message = formData.get("message");
    console.log("Form Data:", phone, message);

    try {
      const { data } = await axios.post(`http://localhost:3000/sendMessage/${phone}`, {
        message,
      });
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
      <div className="flex">
        <label htmlFor="message">Message</label>
        <textarea type="text" name="message" placeholder="Enter Message"></textarea>
      </div>
      <button type="submit">Send</button>
    </form>
  );
}

export default App;

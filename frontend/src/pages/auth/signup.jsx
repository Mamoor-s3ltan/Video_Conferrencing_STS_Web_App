import React, { useState, useEffect } from "react";
import { supabase } from "../../conn.js";
import Header from "../../components/Header";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, country } = formData;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

   try {
  setLoading(true);

  // 🔹 Step 1: Sign up user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

      let imageUrl = null;
      
      if (imageFile) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from("pf_img") // ✅ use the same bucket name consistently
          .upload(`users/${Date.now()}_${imageFile.name}`, imageFile);

        if (imageError) {
          console.error("Error uploading image:", imageError);
          alert("Error uploading image");
          return;
        }

    const { data: publicUrlData } = supabase.storage
      .from("pf_img")
      .getPublicUrl(imageData.path);

    imageUrl = publicUrlData.publicUrl;
  }

      // 🔹 Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 🔹 Save profile data
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            username,
            country,
            avatar_url: imageUrl,
          },
        ]);

        if (profileError) throw profileError;
      }

  alert("Signup successful! Please verify your email.");
} catch (err) {
  console.error("Signup error:", err);
  alert(`Error: ${err.message}`);
} finally {
  setLoading(false);
}
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 gap-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-sm text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

          {["username", "email", "password", "confirmPassword", "country"].map((field, i) => (
            <input
              key={i}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              type={field.includes("password") ? "password" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="bg-[#1E1E1E] border border-gray-600 text-gray-200 placeholder-gray-400 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="bg-[#1E1E1E] border border-gray-600 text-gray-200 placeholder-gray-400 p-3 mb-5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 transition text-white p-3 rounded-lg w-full font-semibold"
          >
            {loading ? "Creating Account..." : "SIGN UP"}
          </button>

          <p className="text-gray-400 text-sm text-center mt-4">
            Already registered?{" "}
            <a href="/signin" className="text-indigo-400 hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
    </>
  );
};

export default Signup;

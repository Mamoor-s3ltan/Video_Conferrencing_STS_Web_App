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

  // 🔹 Step 2: Upload image (after signup)
  if (data.user && imageFile) {
    const { data: imageData, error: imageError } = await supabase.storage
      .from("pf_img") // make sure bucket name matches exactly
      .upload(`users/${data.user.id}/${Date.now()}_${imageFile.name}`, imageFile);

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

  // 🔹 Step 3: Save profile data
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
    <>
      <Header />
    <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 gap-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-sm text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          type="text"
          placeholder="Username"
          className="border border-purple-300 bg-transparent text-white placeholder-purple-200 p-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          placeholder="Email"
          className="border border-purple-300 bg-transparent text-white placeholder-purple-200 p-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          placeholder="Password"
          className="border border-purple-300 bg-transparent text-white placeholder-purple-200 p-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          type="password"
          placeholder="Confirm Password"
          className="border border-purple-300 bg-transparent text-white placeholder-purple-200 p-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          name="country"
          value={formData.country}
          onChange={handleChange}
          type="text"
          placeholder="Country"
          className="border border-purple-300 bg-transparent text-white placeholder-purple-200 p-2 mb-5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* 🔹 Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="border border-purple-300 bg-transparent text-white placeholder-purple-200 p-2 mb-5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 transition-colors text-white p-2 rounded-lg w-full font-semibold"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {/* 🔹 Display Profiles */}
      <div className="flex flex-col gap-4">
        {profile.map((prof) => (
          <div key={prof.id} className="text-center">
            <h2 className="text-white">{prof.username}</h2>
            {prof.avatar_url && (
              <img
                src={prof.avatar_url}
                alt="avatar"
                className="w-20 h-20 rounded-full mx-auto border-2 border-white"
              />
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Signup;

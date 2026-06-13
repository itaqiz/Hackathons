import streamlit as st
from agent import generate_roadmap
from mongodb import users

st.title("VisaPath AI")

profile = st.text_area(
    "Enter your profile"
)

if st.button("Generate Roadmap"):

    roadmap = generate_roadmap(profile)

    users.insert_one({
        "profile": profile,
        "roadmap": roadmap
    })

    st.write(roadmap)
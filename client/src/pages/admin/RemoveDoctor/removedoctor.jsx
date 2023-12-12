import React, { useState, useEffect } from 'react';

function RemoveDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState({
    username: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/Admin/addremove/gett/');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorInfo({ ...doctorInfo, [name]: value });
  };

  const handleRemoveDoctor = async (username) => {
    try {
      const response = await fetch(`http://localhost:5000/Admin/addremove/removeDoctor`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        console.log('Doctor removed', data);
        alert('Doctor removed');
        fetchDoctors(); // Refresh the patient list after removal
      } else {
        console.error('Can not remove doctor', data);
        alert('Can not remove doctor');
      }
    } catch (error) {
      console.error('Error removing doctor', error);
      alert('An error occurred while removing the doctor');
    }
  };

  return (
    <div>
      <h2>Doctors List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.username}>
              <td>{doctor.name}</td>
              <td>{doctor.username}</td>
              <td>{doctor.email}</td>
              <td>
                <button onClick={() => handleRemoveDoctor(doctor.username)}style={{ backgroundColor: 'red', color: 'white', padding: '8px 12px', cursor: 'pointer' }}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

</div>
  );
}

export default RemoveDoctor;
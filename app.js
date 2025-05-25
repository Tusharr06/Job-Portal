// DOM Elements
const jobForm = document.getElementById('jobForm');
const jobId = document.getElementById('jobId');
const titleInput = document.getElementById('title');
const companyInput = document.getElementById('company');
const locationInput = document.getElementById('location');
const salaryInput = document.getElementById('salary');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const requirementsInput = document.getElementById('requirements');
const deadlineInput = document.getElementById('deadline');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const jobListings = document.getElementById('jobListings');
const noJobs = document.getElementById('noJobs');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterType = document.getElementById('filterType');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const applicationsListBody = document.getElementById('applicationsListBody');
const noApplications = document.getElementById('noApplications');
const jobModal = document.getElementById('jobModal');
const jobDetails = document.getElementById('jobDetails');
const applyBtn = document.getElementById('applyBtn');
const applicationModal = document.getElementById('applicationModal');
const applicationForm = document.getElementById('applicationForm');
const applicationJobId = document.getElementById('applicationJobId');
const applicationJobTitle = document.getElementById('applicationJobTitle');

// DOM Elements for Admin Dashboard
const adminDashboardSection = document.getElementById('adminDashboardSection');
const totalJobsElement = document.getElementById('totalJobs');
const totalUsersElement = document.getElementById('totalUsers');
const totalApplicationsElement = document.getElementById('totalApplications');
const activeJobsElement = document.getElementById('activeJobs');
const recentApplicationsBody = document.getElementById('recentApplicationsBody');
const jobManagementBody = document.getElementById('jobManagementBody');

// App State
let jobsData = [];
let applicationsData = [];
let currentlyEditing = null;
let selectedJobId = null;

// Temp user ID (in real app, this would come from authentication)
const currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
jobForm.addEventListener('submit', handleJobFormSubmit);
cancelBtn.addEventListener('click', cancelEdit);
searchInput.addEventListener('input', filterJobs);
filterCategory.addEventListener('change', filterJobs);
filterType.addEventListener('change', filterJobs);
applicationForm.addEventListener('submit', handleApplicationSubmit);
applyBtn.addEventListener('click', openApplicationModal);

// Tab Navigation
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        if (tabId === 'jobs') {
            document.getElementById('jobSearchSection').classList.add('active');
        } else if (tabId === 'post') {
            document.getElementById('postJobSection').classList.add('active');
        } else if (tabId === 'applications') {
            document.getElementById('applicationsSection').classList.add('active');
            loadApplications();
        } else if (tabId === 'dashboard') {
            document.getElementById('adminDashboardSection').classList.add('active');
            loadAdminDashboard();
        }
    });
});

// Modal Close Buttons
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        jobModal.style.display = 'none';
        applicationModal.style.display = 'none';
    });
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === jobModal) {
        jobModal.style.display = 'none';
    }
    if (event.target === applicationModal) {
        applicationModal.style.display = 'none';
    }
});

// Initialize App
function initApp() {
    loadJobs();
    
    // Set default deadline to 30 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    deadlineInput.valueAsDate = defaultDeadline;
}

// Load jobs from Firestore
function loadJobs() {
    jobsCollection.orderBy('postedAt', 'desc').onSnapshot(snapshot => {
        jobsData = [];
        snapshot.forEach(doc => {
            const job = {
                id: doc.id,
                ...doc.data()
            };
            jobsData.push(job);
        });
        
        displayJobs(jobsData);
    }, error => {
        console.error("Error loading jobs:", error);
    });
}

// Load applications for current user
function loadApplications() {
    applicationsCollection.where('userId', '==', currentUserId)
                         .orderBy('appliedAt', 'desc')
                         .onSnapshot(snapshot => {
        applicationsData = [];
        snapshot.forEach(doc => {
            const application = {
                id: doc.id,
                ...doc.data()
            };
            applicationsData.push(application);
        });
        
        displayApplications(applicationsData);
    }, error => {
        console.error("Error loading applications:", error);
    });
}

// Display jobs in the listings
function displayJobs(jobs) {
    jobListings.innerHTML = "";
    
    if (jobs.length === 0) {
        noJobs.classList.remove('hidden');
    } else {
        noJobs.classList.add('hidden');
        
        jobs.forEach(job => {
            const deadlineDate = job.deadline ? new Date(job.deadline) : null;
            const isExpired = deadlineDate && deadlineDate < new Date();
            
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.dataset.id = job.id;
            
            jobCard.innerHTML = `
                <div class="job-card-header">
                    <div>
                        <h3 class="job-card-title">${job.title}</h3>
                        <p class="job-card-company">${job.company}</p>
                    </div>
                    <span class="job-type ${job.type}">${job.type}</span>
                </div>
                <div class="job-meta">
                    <span class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                    <span class="job-meta-item job-salary"><i class="fas fa-money-bill-wave"></i> ${job.salary}</span>
                    <span class="job-meta-item"><i class="fas fa-folder"></i> ${job.category}</span>
                    ${deadlineDate ? `<span class="job-meta-item job-deadline"><i class="fas fa-calendar-times"></i> ${isExpired ? 'Deadline passed' : 'Apply by ' + formatDate(job.deadline)}</span>` : ''}
                </div>
                <p class="job-description">${job.description}</p>
            `;
            
            jobCard.addEventListener('click', () => showJobDetails(job.id));
            
            jobListings.appendChild(jobCard);
        });
    }
}

// Display applications in the table
function displayApplications(applications) {
    applicationsListBody.innerHTML = "";
    
    if (applications.length === 0) {
        noApplications.style.display = 'block';
    } else {
        noApplications.style.display = 'none';
        
        applications.forEach(application => {
            // Get job details
            getJobById(application.jobId).then(job => {
                if (job) {
                    const row = document.createElement('tr');
                    
                    const statusClass = 
                        application.status === 'Approved' ? 'status-approved' : 
                        application.status === 'Rejected' ? 'status-rejected' : 
                        'status-pending';
                    
                    row.innerHTML = `
                        <td>${job.title}</td>
                        <td>${job.company}</td>
                        <td>${formatDate(application.appliedAt.toDate())}</td>
                        <td><span class="application-status ${statusClass}">${application.status}</span></td>
                        <td>
                            <button class="action-btn" onclick="viewApplication('${application.id}')">View</button>
                            ${application.status === 'Pending' ? `<button class="action-btn danger-btn" onclick="withdrawApplication('${application.id}')">Withdraw</button>` : ''}
                        </td>
                    `;
                    
                    applicationsListBody.appendChild(row);
                }
            });
        });
    }
}

// Get job by ID
async function getJobById(id) {
    try {
        const doc = await jobsCollection.doc(id).get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        return null;
    } catch (error) {
        console.error("Error getting job:", error);
        return null;
    }
}

// Show job details in modal
function showJobDetails(id) {
    selectedJobId = id;
    const job = jobsData.find(job => job.id === id);
    
    if (job) {
        const deadlineDate = job.deadline ? new Date(job.deadline) : null;
        const isExpired = deadlineDate && deadlineDate < new Date();
        
        jobDetails.innerHTML = `
            <h2>${job.title}</h2>
            <p class="job-details-company">${job.company}</p>
            
            <div class="job-details-meta">
                <div class="job-details-meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.location}</span>
                </div>
                <div class="job-details-meta-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>${job.salary}</span>
                </div>
                <div class="job-details-meta-item">
                    <i class="fas fa-briefcase"></i>
                    <span>${job.type}</span>
                </div>
                <div class="job-details-meta-item">
                    <i class="fas fa-folder"></i>
                    <span>${job.category}</span>
                </div>
                ${deadlineDate ? `
                <div class="job-details-meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${isExpired ? '<span class="job-deadline">Deadline passed</span>' : 'Apply by ' + formatDate(job.deadline)}</span>
                </div>` : ''}
                <div class="job-details-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>Posted on ${formatDate(job.postedAt.toDate())}</span>
                </div>
            </div>
            
            <div class="job-section">
                <h3>Job Description</h3>
                <p>${job.description.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="job-section">
                <h3>Requirements</h3>
                <p>${job.requirements.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        
        // Check if user has already applied
        checkIfApplied(id).then(hasApplied => {
            if (hasApplied) {
                applyBtn.textContent = 'Already Applied';
                applyBtn.disabled = true;
            } else if (isExpired) {
                applyBtn.textContent = 'Deadline Passed';
                applyBtn.disabled = true;
            } else {
                applyBtn.textContent = 'Apply Now';
                applyBtn.disabled = false;
            }
        });
        
        jobModal.style.display = 'block';
    }
}

// Check if user has already applied to this job
async function checkIfApplied(jobId) {
    try {
        const snapshot = await applicationsCollection
            .where('userId', '==', currentUserId)
            .where('jobId', '==', jobId)
            .get();
        
        return !snapshot.empty;
    } catch (error) {
        console.error("Error checking application:", error);
        return false;
    }
}

// Open application modal
function openApplicationModal() {
    const job = jobsData.find(job => job.id === selectedJobId);
    if (job) {
        applicationJobId.value = selectedJobId;
        applicationJobTitle.textContent = job.title;
        applicationModal.style.display = 'block';
        jobModal.style.display = 'none';
    }
}

// Handle job form submission
function handleJobFormSubmit(e) {
    e.preventDefault();
    
    const jobData = {
        title: titleInput.value.trim(),
        company: companyInput.value.trim(),
        location: locationInput.value.trim(),
        salary: salaryInput.value.trim(),
        type: typeInput.value,
        category: categoryInput.value,
        description: descriptionInput.value.trim(),
        requirements: requirementsInput.value.trim(),
        deadline: deadlineInput.value,
        postedAt: currentlyEditing ? firebase.firestore.FieldValue.serverTimestamp() : firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (currentlyEditing) {
        updateJob(currentlyEditing, jobData);
    } else {
        addJob(jobData);
    }
}

// Add a new job
function addJob(jobData) {
    return jobsCollection.add(jobData)
        .then(() => {
            console.log("Job added successfully");
            resetJobForm();
        })
        .catch(error => {
            console.error("Error adding job:", error);
        });
}

// Update a job
function updateJob(id, jobData) {
    return jobsCollection.doc(id).update(jobData)
        .then(() => {
            console.log("Job updated successfully");
            resetJobForm();
        })
        .catch(error => {
            console.error("Error updating job:", error);
        });
}

// Delete a job
function deleteJob(id) {
    if (confirm("Are you sure you want to delete this job listing?")) {
        jobsCollection.doc(id).delete()
            .then(() => {
                console.log("Job deleted successfully");
            })
            .catch(error => {
                console.error("Error deleting job:", error);
            });
    }
}

// Handle application submission
function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const applicantName = document.getElementById('applicantName').value.trim();
    const applicantEmail = document.getElementById('applicantEmail').value.trim();
    const applicantPhone = document.getElementById('applicantPhone').value.trim();
    const applicantResume = document.getElementById('applicantResume').value.trim();
    const coverLetter = document.getElementById('coverLetter').value.trim();
    
    const applicationData = {
        jobId: applicationJobId.value,
        userId: currentUserId,
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        resumeLink: applicantResume,
        coverLetter: coverLetter,
        status: 'Pending',
        appliedAt: firebase.firestore.Timestamp.now()
    };
    
    submitApplication(applicationData);
}

// Submit application
function submitApplication(applicationData) {
    applicationsCollection.add(applicationData)
        .then(() => {
            console.log("Application submitted successfully");
            alert("Your application has been submitted successfully!");
            applicationForm.reset();
            applicationModal.style.display = 'none';
        })
        .catch(error => {
            console.error("Error submitting application:", error);
            alert("Error submitting application. Please try again.");
        });
}

// View application details
function viewApplication(id) {
    const application = applicationsData.find(app => app.id === id);
    if (application) {
        getJobById(application.jobId).then(job => {
            if (job) {
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.style.display = 'block';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close" onclick="closeApplicationDetailModal(this)">&times;</span>
                        <h2>Application Details</h2>
                        <div class="job-section">
                            <h3>Job Information</h3>
                            <p><strong>Title:</strong> ${job.title}</p>
                            <p><strong>Company:</strong> ${job.company}</p>
                        </div>
                        <div class="job-section">
                            <h3>Application Information</h3>
                            <p><strong>Applied On:</strong> ${formatDate(application.appliedAt.toDate())}</p>
                            <p><strong>Status:</strong> <span class="application-status ${application.status === 'Approved' ? 'status-approved' : application.status === 'Rejected' ? 'status-rejected' : 'status-pending'}">${application.status}</span></p>
                        </div>
                        <div class="job-section">
                            <h3>Your Information</h3>
                            <p><strong>Name:</strong> ${application.name}</p>
                            <p><strong>Email:</strong> ${application.email}</p>
                            <p><strong>Phone:</strong> ${application.phone}</p>
                            <p><strong>Resume Link:</strong> <a href="${application.resumeLink}" target="_blank">${application.resumeLink}</a></p>
                        </div>
                        <div class="job-section">
                            <h3>Cover Letter</h3>
                            <p>${application.coverLetter.replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
            }
        });
    }
}

// Close application detail modal
function closeApplicationDetailModal(closeBtn) {
    const modal = closeBtn.closest('.modal');
    modal.style.display = 'none';
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Withdraw application
function withdrawApplication(id) {
    if (confirm("Are you sure you want to withdraw this application?")) {
        applicationsCollection.doc(id).delete()
            .then(() => {
                console.log("Application withdrawn successfully");
            })
            .catch(error => {
                console.error("Error withdrawing application:", error);
            });
    }
}

// Cancel editing job
function cancelEdit() {
    currentlyEditing = null;
    resetJobForm();
}

// Reset job form
function resetJobForm() {
    jobForm.reset();
    jobId.value = '';
    currentlyEditing = null;
    submitBtn.textContent = 'Post Job';
    cancelBtn.classList.add('hidden');
    
    // Set default deadline to 30 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    deadlineInput.valueAsDate = defaultDeadline;
}

// Filter jobs based on search input and filters
function filterJobs() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;
    const typeFilter = filterType.value;
    
    const filteredJobs = jobsData.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm) || 
                            job.company.toLowerCase().includes(searchTerm) || 
                            job.description.toLowerCase().includes(searchTerm);
        
        const matchesCategory = categoryFilter === 'All' || job.category === categoryFilter;
        const matchesType = typeFilter === 'All' || job.type === typeFilter;
        
        return matchesSearch && matchesCategory && matchesType;
    });
    
    displayJobs(filteredJobs);
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

// Make functions available globally
window.editJob = function(id) {
    const job = jobsData.find(job => job.id === id);
    if (!job) return;
    
    currentlyEditing = id;
    jobId.value = id;
    titleInput.value = job.title;
    companyInput.value = job.company;
    locationInput.value = job.location;
    salaryInput.value = job.salary;
    typeInput.value = job.type;
    categoryInput.value = job.category;
    descriptionInput.value = job.description;
    requirementsInput.value = job.requirements;
    deadlineInput.value = job.deadline;
    
    submitBtn.textContent = 'Update Job';
    cancelBtn.classList.remove('hidden');
    
    // Switch to post job tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="post"]').classList.add('active');
    
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('postJobSection').classList.add('active');
};

window.deleteJob = deleteJob;
window.viewApplication = viewApplication;
window.withdrawApplication = withdrawApplication;
window.closeApplicationDetailModal = closeApplicationDetailModal;

// Load Admin Dashboard Data
async function loadAdminDashboard() {
    if (!isAdmin) return;

    try {
        // Get total jobs
        const jobsSnapshot = await jobsCollection.get();
        const totalJobs = jobsSnapshot.size;
        totalJobsElement.textContent = totalJobs;

        // Get active jobs (not expired)
        const now = new Date();
        let activeJobs = 0;
        jobsSnapshot.forEach(doc => {
            const job = doc.data();
            if (new Date(job.deadline) > now) {
                activeJobs++;
            }
        });
        activeJobsElement.textContent = activeJobs;

        // Get total users
        const usersSnapshot = await usersCollection.get();
        totalUsersElement.textContent = usersSnapshot.size;

        // Get total applications
        const applicationsSnapshot = await applicationsCollection.get();
        totalApplicationsElement.textContent = applicationsSnapshot.size;

        // Load recent applications
        loadRecentApplications();

        // Load job management table
        loadJobManagement();
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

// Load Recent Applications
async function loadRecentApplications() {
    try {
        const snapshot = await applicationsCollection
            .orderBy('appliedAt', 'desc')
            .limit(10)
            .get();

        recentApplicationsBody.innerHTML = '';

        snapshot.forEach(async doc => {
            const application = doc.data();
            const job = await getJobById(application.jobId);
            
            if (job) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${application.name}</td>
                    <td>${job.title}</td>
                    <td>${formatDate(application.appliedAt.toDate())}</td>
                    <td>
                        <span class="status-badge ${application.status.toLowerCase()}">${application.status}</span>
                    </td>
                    <td>
                        <button class="action-btn view-btn" onclick="viewApplicationDetails('${doc.id}')">
                            View
                        </button>
                        ${application.status === 'Pending' ? `
                            <button class="action-btn approve-btn" onclick="updateApplicationStatus('${doc.id}', 'Approved')">
                                Approve
                            </button>
                            <button class="action-btn reject-btn" onclick="updateApplicationStatus('${doc.id}', 'Rejected')">
                                Reject
                            </button>
                        ` : ''}
                    </td>
                `;
                recentApplicationsBody.appendChild(row);
            }
        });
    } catch (error) {
        console.error("Error loading recent applications:", error);
    }
}

// Load Job Management Table
async function loadJobManagement() {
    try {
        const snapshot = await jobsCollection
            .orderBy('postedAt', 'desc')
            .get();

        jobManagementBody.innerHTML = '';

        snapshot.forEach(async doc => {
            const job = doc.data();
            const applicationsSnapshot = await applicationsCollection
                .where('jobId', '==', doc.id)
                .get();

            const now = new Date();
            const isExpired = new Date(job.deadline) < now;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${job.title}</td>
                <td>${job.company}</td>
                <td>${formatDate(job.postedAt.toDate())}</td>
                <td>${applicationsSnapshot.size}</td>
                <td>
                    <span class="status-badge ${isExpired ? 'status-expired' : 'status-active'}">
                        ${isExpired ? 'Expired' : 'Active'}
                    </span>
                </td>
                <td>
                    <button class="action-btn view-btn" onclick="viewJob('${doc.id}')">
                        View
                    </button>
                    <button class="action-btn" onclick="editJob('${doc.id}')">
                        Edit
                    </button>
                    <button class="action-btn reject-btn" onclick="deleteJob('${doc.id}')">
                        Delete
                    </button>
                </td>
            `;
            jobManagementBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading job management:", error);
    }
}

// Update Application Status
async function updateApplicationStatus(applicationId, status) {
    try {
        await applicationsCollection.doc(applicationId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        loadRecentApplications();
    } catch (error) {
        console.error("Error updating application status:", error);
    }
}

// View Application Details
function viewApplicationDetails(applicationId) {
    // Implementation similar to viewApplication but with admin controls
    const application = applicationsData.find(app => app.id === applicationId);
    if (application) {
        getJobById(application.jobId).then(job => {
            if (job) {
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.style.display = 'block';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close" onclick="closeApplicationDetailModal(this)">&times;</span>
                        <h2>Application Details</h2>
                        <div class="job-section">
                            <h3>Job Information</h3>
                            <p><strong>Title:</strong> ${job.title}</p>
                            <p><strong>Company:</strong> ${job.company}</p>
                        </div>
                        <div class="job-section">
                            <h3>Application Information</h3>
                            <p><strong>Applied On:</strong> ${formatDate(application.appliedAt.toDate())}</p>
                            <p><strong>Status:</strong> 
                                <span class="status-badge ${application.status.toLowerCase()}">${application.status}</span>
                            </p>
                        </div>
                        <div class="job-section">
                            <h3>Applicant Information</h3>
                            <p><strong>Name:</strong> ${application.name}</p>
                            <p><strong>Email:</strong> ${application.email}</p>
                            <p><strong>Phone:</strong> ${application.phone}</p>
                            <p><strong>Resume:</strong> <a href="${application.resumeLink}" target="_blank">View Resume</a></p>
                        </div>
                        <div class="job-section">
                            <h3>Cover Letter</h3>
                            <p>${application.coverLetter.replace(/\n/g, '<br>')}</p>
                        </div>
                        ${application.status === 'Pending' ? `
                            <div class="modal-buttons">
                                <button class="action-btn approve-btn" onclick="updateApplicationStatus('${applicationId}', 'Approved')">
                                    Approve Application
                                </button>
                                <button class="action-btn reject-btn" onclick="updateApplicationStatus('${applicationId}', 'Rejected')">
                                    Reject Application
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                document.body.appendChild(modal);
            }
        });
    }
}

// Make admin functions available globally
window.updateApplicationStatus = updateApplicationStatus;
window.viewApplicationDetails = viewApplicationDetails;
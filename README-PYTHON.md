# Enterprise Document Generator (Python & GitHub Pages Handbook)

If you have been experiencing issues with deploying your web app to GitHub Pages, or if you want to transition your workflow to run **100% locally on your computer's terminal using Python**, this handbook explains both solutions step-by-step.

---

## 🛠️ Part 1: How to Fix GitHub Pages Depoyments on Actions

If your GitHub Action completes but you get a blank page or no deployment option is active, it is because **GitHub repositories are set to deploy from a branch by default**. To let your `.github/workflows/deploy.yml` action actually publish the site:

1. Open your repository on **GitHub.com**.
2. Go to the **⚙️ Settings** tab of your repository at the top of the page.
3. On the left sidebar menu, scroll down and click on **⚡ Pages** (under the "Code and automation" division).
4. Look under the **Build and deployment** heading.
5. In the **Source** dropdown menu, change the selection from **"Deploy from a branch"** to **"GitHub Actions"**.
6. Commit any minor change or manually trigger the workflow again.

GitHub Actions will now have full write permissions to activate and deploy your page instantly!

---

## 🐍 Part 2: How to Run the Python Local Database Engine

We have built a beautiful, lightweight **Python Local Web App** using **Flask and SQLite** right inside your codebase alongside your React frontend. It provides:
* 🗄️ **Persistent storage** inside a local database file `invoices.db` (runs on SQLite, meaning your invoice logs, job sheets, and company profile are saved forever, even if you clear your browser cache!).
* 🎨 **Stunning visual themes** utilizing Tailwind CSS.
* 🖨️ **Browser high-fidelity printing template** configured to scale your document letterheads for direct printing or compiling to a crisp, unblurred PDF.

### 🚀 Running the Python App in Your Local Terminal

#### Step 1: Clone your Repository locally
Open your computer's terminal or command prompt (CMD) and pull down your repository:
```bash
git clone <your-repository-url>
cd <repository-folder-name>
```

#### Step 2: Install dependencies
Ensure you have Python 3 installed. Type this command to install the lightweight requirements:
```bash
pip install -r requirements.txt
```

#### Step 3: Run the local engine
Launch the Flask backend server:
```bash
python app.py
```

#### Step 4: Access the Workspace
Once the terminal displays that the server is running, open your web browser and navigate to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

### 🌟 Key Features of Your Python Workspace
* **Quotation Builder / Draft Grid**: Create corporate quotes, insert custom calibration scopes, prices, and quantities. Add or delete line items with ease.
* **Invoice Finalizer**: Instantly pull up saved quotes from your SQLite database and finalize them as formal Tax Invoices under reference order tracking numbers.
* **Job Book DB Sheet**: Seek, search, and audit your logged spreadsheet rows.
* **Corporate Profile Configuration**: Dynamically update your business details (address, tagline, email, registration phone) or upload of your custom JPG/PNG company logo.
* **High-Contrast Styling Mode**: Choose between a *Minimalist Modern Letterhead* or structured *Classic Accounting Grid* format.

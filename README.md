# Kubernetes Auto-Deployer 🚀

Automate Application Deployment to Kubernetes with Zero Manual Overhead

---

## 📊 Architecture Overview

This platform empowers users to deploy applications to a Kubernetes cluster automatically—directly from their GitHub repositories. With seamless GitHub Actions workflows and GitOps synchronization via ArgoCD, application updates are continuously delivered and deployed without manual intervention.

---

## 🚀 Workflow

1. **User Onboarding**  
   A user submits a form providing:
   - GitHub Repository URL
   - Application Name
   - Personal GitHub Token

2. **Repository Bootstrapping**  
   The backend clones a **predefined template repository** into a **new repository** for the user. This template contains two key GitHub Actions workflows:
   - `Import User Repo`: Imports the user's source code automatically.
   - `Build & Deploy`: Builds, tests, containerizes, and deploys the application.

3. **CI/CD Automation**  
   - After the user’s repo is imported, the **Build & Deploy** workflow triggers:
     - Detects application language (Node.js, Python, Java)
     - Builds and tests the application
     - Generates a Docker image
     - Pushes the image to Docker Hub
     - Updates Kubernetes manifests

4. **Continuous Deployment (GitOps)**  
   - A webhook on the user’s original repository listens for new commits.
   - Any commit triggers the automation pipeline again (sync, build, deploy).
   - **ArgoCD** watches Kubernetes manifests and ensures the cluster stays up-to-date with the latest deployment.

---

## 🛠️ Repository Structure

```
│   README.md
│
├───.github
│   └───workflows
│       │   import-user-repo.yml
│       │   build-and-deploy.yml
│
├───deploy
│       deploy.yaml
│       svc.yaml
│
└───<application source code> 
```

---

## ✨ Features We Will Use 

- Git & GitHub for version control
- Docker for containerization
- Kubernetes for container orchestration
- GitHub Actions for CI/CD automation
- ArgoCD for continuous deployment (GitOps)
- Automatic language detection and Dockerfile generation

---

## 🖥️ Test Your Application Locally

We recommend testing your application locally before deploying.

### Pre-requisites

- Install Docker
- Install Python / Node.js / Java (depending on your app)

### Steps

```bash
git clone <your-repository-url>
cd <your-project-directory>

# For Python
pip install -r requirements.txt
python main.py

# For Node.js
npm install
npm start

# For Java (Maven)
mvn install
java -jar target/app.jar
```

Access the application locally (port depends on your framework—typically 5000 or 8080).

---

## 🐳 Containerize Your Application

Our workflow auto-generates Dockerfiles, but you can test it locally:

```bash
docker build -t <your-dockerhub-username>/<app-name>:v1 .
docker run -d -p 5000:5000 <your-dockerhub-username>/<app-name>:v1
```

If your app runs successfully, you’re ready for CI/CD!

---

## ⚙️ CI/CD Workflows

### 📥 Import User Repository Workflow

`.github/workflows/import-user-repo.yml`

```yaml
name: Import User Repo

on:
  workflow_dispatch:
    inputs:
      user_repo_url:
        description: 'User GitHub Repo URL'
        required: true
        type: string

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  import:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout current repo
        uses: actions/checkout@v3

      - name: Clone user repo
        run: git clone ${{ github.event.inputs.user_repo_url }} user-repo

      - name: Sync contents
        run: |
          find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.github' ! -name 'README.md' ! -name 'user-repo' -exec rm -rf {} +
          rsync -av --exclude='.git' --exclude='.github' user-repo/ .
          rm -rf user-repo

      - name: Commit and Push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git remote set-url origin https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}
          git add .
          git commit -m "Sync from user repo (via webhook)" || echo "Nothing to commit"
          git push origin main
```

---

### ⚙️ Build & Deploy Workflow

`.github/workflows/build-and-deploy.yml`

```yaml
name: Build & Deploy

on:
  workflow_run:
    workflows: ["Import User Repo"]
    types:
      - completed

jobs:
  detect-and-build:
    runs-on: ubuntu-latest

    env:
      COMMIT_SHA: ${{ github.sha }}
      VERSION_TAG: latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set IMAGE_NAME
        run: |
          REPO_NAME=$(basename "${GITHUB_REPOSITORY}" | tr '[:upper:]' '[:lower:]')
          echo "IMAGE_NAME=${{ secrets.DOCKERHUB_USERNAME }}/$REPO_NAME" >> $GITHUB_ENV

      - name: Detect language
        id: language_detection
        run: |
          if find . -name "package.json" | grep -q .; then
            echo "NODE=true" >> $GITHUB_ENV
          elif find . -name "requirements.txt" | grep -q .; then
            echo "PYTHON=true" >> $GITHUB_ENV
          elif find . -name "pom.xml" | grep -q .; then
            echo "JAVA=true" >> $GITHUB_ENV
          elif [ -f "Dockerfile" ]; then
            echo "DOCKER=true" >> $GITHUB_ENV
          else
            echo "UNKNOWN=true" >> $GITHUB_ENV
            exit 1

      - name: Build & Test (Node.js)
        if: env.NODE == 'true'
        run: |
          npm install
          npm test

      - name: Build & Test (Python)
        if: env.PYTHON == 'true'
        run: |
          pip install -r requirements.txt
          pytest || echo "No tests found"

      - name: Build & Test (Java)
        if: env.JAVA == 'true'
        run: |
          mvn install
          mvn test

      - name: Generate Dockerfile (if needed)
        run: |
          if [ "${NODE}" = "true" ] && [ -z "${DOCKER}" ]; then
            echo -e "FROM node:16\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]" > Dockerfile
          elif [ "${PYTHON}" = "true" ] && [ -z "${DOCKER}" ]; then
            echo -e "FROM python:3.9\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD [\"python\", \"main.py\"]" > Dockerfile
          elif [ "${JAVA}" = "true" ] && [ -z "${DOCKER}" ]; then
            echo -e "FROM openjdk:11\nWORKDIR /app\nCOPY . .\nRUN mvn clean install\nCMD [\"java\", \"-jar\", \"target/app.jar\"]" > Dockerfile
          fi

      - name: Login to DockerHub
        run: echo "${{ secrets.DOCKERHUB_PASSWORD }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Build Docker image
        run: docker build -t $IMAGE_NAME:$VERSION_TAG -t $IMAGE_NAME:$COMMIT_SHA .

      - name: Push Docker image to DockerHub
        run: docker push $IMAGE_NAME:$COMMIT_SHA
```



### ⚙️ deploy-to-aks Workflow

`.github/workflows/deploy-to-aks.yml`

```yaml
name: Connect to Azure AKS with Username and Password

on:
  workflow_run:
    workflows: ["Build & Deploy"]
    types:
      - completed
permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  connect-to-aks:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v3

    - name: Log in to Azure with Username and Password
      run: |
        az login --username ${{ secrets.AZURE_USERNAME }} --password ${{ secrets.AZURE_PASSWORD }} --tenant ${{ secrets.AZURE_TENANT_ID }}
    - name: Set up Azure CLI
      run: az account show

    - name: Get AKS credentials
      run: |
        az aks get-credentials --resource-group ${{ secrets.AZURE_RESOURCE_GROUP }} --name ${{ secrets.AZURE_AKS_CLUSTER_NAME }}

    - name: Verify Connection to AKS
      run: |
        kubectl get nodes
        kubectl get deployments --all-namespaces=true

    - name: Set APP_NAME from repo name
      run: |
        FULL_NAME=$(basename "${GITHUB_REPOSITORY}")
        APP_NAME=$(echo "$FULL_NAME" | sed -E 's/^user-(.*)-deployed$/\1/')
        echo "APP_NAME=$APP_NAME" >> $GITHUB_ENV

    - name: Update placeholders in manifests/application.yaml
      run: |
          sed -i -e "s|{{APP_NAME}}|${{ env.APP_NAME }}|" \
                 -e "s|{{REPO_URL}}|https://github.com/${{ github.repository }}|" \
                 -e "s|{{REPO_PATH}}|manifests|" \
                 -e "s|{{DEST_NAMESPACE}}|${{ env.APP_NAME }}|" \
                 manifests/application.yaml
    - name: Update placeholders in manifests/ingress.yaml
      run: |
          sed -i -e "s|{{APP_NAME}}|${{ env.APP_NAME }}|"  manifests/ingress.yaml
    - name: Commit and push updated manifest
      run: |
        git config --global user.email "actions@github.com"
        git config --global user.name "GitHub Actions"
        git remote set-url origin https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}
        git add manifests/application.yaml
        git add manifests/ingress.yaml
        git commit -m "Update application and ingress with deployment values"
        git push
    - name: Deploy ArgoCD Application
      run: kubectl apply -f manifests/application.yaml -n argocd
```
---

## 🛡️ Setup ArgoCD in Minikube Cluster (Option 1)

Note: You can setup Argo CD in any cluster, instructions are same.

- First install Minikube:
  Installation guide for installing Minikube.
  [Minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fwindows%2Fx86-64%2Fstable%2F.exe+download)

---

- Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

- Expose ArgoCD UI

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
kubectl get svc -n argocd
```

- Verify if ArgoCD is running:

```
kubectl get all -n argocd
```

- Grab ArgoCD secret for accessing UI

```
kubectl get secrets -n argocd argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
```

- Access ArgoCD UI (for Minikube users)

```bash
minikube service argocd-server -n argocd
```
---

## 🛡️ Setup ArgoCD in Azure AKS (Option 2)

### Step 1: Prerequisites

Ensure the following prerequisites are met before getting started:

- **Azure Account**  
  Ensure you have an active Azure account. [Sign up for free](https://azure.microsoft.com/free) if needed.

- **Install Required Tools**
  - [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
  - [kubectl](https://kubernetes.io/docs/tasks/tools/)
  - [Docker](https://docs.docker.com/get-docker/)

---

### Step 2: Create an Azure Kubernetes Service (AKS) Cluster

1. **Login to Azure**
   ```bash
   az login
   ```

2. **Create a Resource Group**
   ```bash
   az group create --name myResourceGroup --location eastus
   ```

3. **Create an AKS Cluster**
   ```bash
   az aks create --resource-group myResourceGroup --name myAKSCluster --node-count 1 --enable-addons monitoring --generate-ssh-keys
   ```

4. **Connect to the AKS Cluster**
   ```bash
   az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
   ```

---

### Step 3: Containerize the <app-name> Application

1. **Build the Docker Image**  
   Replace `<DOCKER_USERNAME>` with your Docker Hub username:
   ```bash
   docker build -t <DOCKER_USERNAME>/<app-name>:latest .
   ```

2. **Push the Image to Docker Hub**
   ```bash
   docker push <DOCKER_USERNAME>/<app-name>:latest
   ```

---

### Step 4: Deploy the Application to AKS

#### Kubernetes Manifest Files

- **deploy.yaml**
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: <app-name>
    labels:
      app: <app-name>
  spec:
    replicas: 2
    selector:
      matchLabels:
        app: <app-name>
    template:
      metadata:
        labels:
          app: <app-name>
      spec:
        containers:
        - name: <app-name>
          image: <DOCKER_USERNAME>/<app-name>:latest
          ports:
          - containerPort: 5000
  ```

- **svc.yaml**
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: flask-service
  spec:
    type: LoadBalancer
    selector:
      app: <app-name>
    ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  ```

  - **Application.yaml**
  ```yaml
  apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: {{APP_NAME}}
     namespace: argocd
   spec:
     project: default
     source:
       repoURL: {{REPO_URL}}
       targetRevision: HEAD
       path: {{REPO_PATH}}
     destination:
       server: https://kubernetes.default.svc
       namespace: {{DEST_NAMESPACE}}
     syncPolicy:
       automated:
         prune: true
         selfHeal: true
       syncOptions:
         - CreateNamespace=true
  ```
  - **ingress.yaml**
  ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: {{APP_NAME}}-ingress
     namespace: {{APP_NAME}}
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
     ingressClassName: nginx
     rules:
     - host: {{APP_NAME}}.eastus.cloudapp.azure.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: {{APP_NAME}}-service
               port:
                 number: 5000
  ```

---

#### Deploy to AKS

1. **Apply the Deployment**
   ```bash
   kubectl apply -f deploy.yaml
   ```

2. **Expose the Application**
   ```bash
   kubectl apply -f svc.yaml
   ```

3. **Get the External IP**
   ```bash
   kubectl get svc
   ```

4. **Access the Application**  
   Visit `http://<EXTERNAL-IP>` in your browser.

---

### Step 5: Set Up ArgoCD for GitOps

1. **Install ArgoCD**
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```

2. **Expose ArgoCD Server**
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   ```

3. **Get ArgoCD Admin Password**
   ```bash
   kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
   ```

4. **Access the ArgoCD UI**  
   Visit `http://localhost:8080`  
   - **Username:** `admin`
   - **Password:** (password from above command)

5. **Configure the Application in ArgoCD**
   - **Application Name:** `demo-app`
   - **Repository URL:** `https://github.com/<username>/Flask-App-GitHub-Actions-ArgoCD.git`
   - **Path:** (directory containing Kubernetes manifests, e.g., `deploy`)
   - **Cluster URL:**
     - For AKS: `https://<your-cluster-name>.hcp.<region>.azmk8s.io:443`
     - Default: `https://kubernetes.default.svc`
   - **Namespace:** `default` (or your custom namespace)

---

### Step 6: Verify the Deployment

1. **Check Pods**
   ```bash
   kubectl get pods
   ```

2. **Access the Application**  
   Visit the `EXTERNAL-IP` of your service in a browser to access your <app-name> application.

---

### Step 7: Optimize Costs (Optional)

- **Scale Down Node Pools**
   ```bash
   az aks nodepool scale --resource-group myResourceGroup --cluster-name myAKSCluster --name nodepool1 --node-count 1
   ```

- **Delete Unused Public IPs**
   ```bash
   az network public-ip delete --ids $(az network public-ip list --query "[?ipAddress!=null].id" -o tsv)
   ```

- **Delete Persistent Volumes (if not needed)**
   ```bash
   kubectl delete pvc --all
   ```

---

## ✅ Summary

This project provides a full **CI/CD + GitOps** solution for automatically deploying applications to Kubernetes. Once set up, users can simply push to their repository, and their application will build, containerize, and deploy—automatically and reliably.

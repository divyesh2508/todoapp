pipeline {
    agent any
    
    parameters {
        string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'Docker tag for the image')
    }

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "${DOCKER_TAG}"
        AWS_REGION = "ap-south-1"
        AWS_DEFAULT_REGION = "ap-south-1"
        AWS_ACCOUNT_URL = "https://910253526187.dkr.ecr.ap-south-1.amazonaws.com"
        INSTANCE_IP = '13.200.160.5'
        SONARQUBE_SERVER = 'SonarQube'
        SLACK_CHANNEL = '#jenkin'
        SLACK_CREDENTIAL_ID = 'jenkins-git-cicd3'
        CONTAINER_NAME = 'todoserver'
        S3_BUCKET_NAME = "my-todo-app-test"
        ENV_FILE_PATH = ".env"
        AWS_CREDENTIALS_ID = 'aws-creds'
        COMMIT_INFO = ''
        KUBE_REPO_URL = "https://github.com/divyesh2508/todo-kube.git"
    }

    stages {
        stage('Checkout') {
            steps {
                sh 'git config --global http.postBuffer 524288000'  // Increase buffer size for large repos
                // Checkout the repository
                checkout scm
            }
        }
        stage('Capture Git Info') {
            steps {
                script {
                    // Capture all commits made since the last build
                    env.COMMIT_INFO = sh(script: "git log --pretty=format:'%an: %s' HEAD~10..HEAD", returnStdout: true).trim()
                }
            }
        }
        stage('Build') {
            steps {
                echo 'Building Docker image...'
                script {
                    def myImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    docker.withRegistry("${AWS_ACCOUNT_URL}", "ecr:${AWS_DEFAULT_REGION}:aws-creds") {
                        myImage.push("${IMAGE_TAG}")
                    }
                    echo "Built and pushed Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Update Kubernetes Deployment') {
            steps {
                // Clone the Kubernetes deployment repository
                git url: "${KUBE_REPO_URL}", branch: 'master', credentialsId: "divyesh-git-cred"
                
                // Update the image tag in the deployment YAML file
                sh """
                    sed -i 's|<tag>|${IMAGE_TAG}|g' dev/apache/apache_deployment.yaml
                """
                sh "cat dev/apache/apache_deployment.yaml"


                // Commit and push changes back to GitHub with credentials
        withCredentials([usernamePassword(credentialsId: 'divyesh-git-cred', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
            sh """
                git config user.name "divyesh2508"
                git config user.email "divyeshl@zignuts.com"
                git add dev/apache/apache_deployment.yaml
                git commit -m "Update image tag to ${IMAGE_TAG}"
                
                // Set authenticated URL and push changes
                git remote set-url origin https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/divyesh2508/todo-kube.git
                git push origin main
            """
        }

                // Apply the updated Kubernetes deployment file
                sh "kubectl apply -f path/to/deployment.yaml"
                
                echo "Updated Kubernetes deployment with image tag: ${IMAGE_TAG}"
            }
        }
    }



    }

    post {
        success {
            script {
                // Ensure we are in the workspace directory for git commands
                dir("${env.WORKSPACE}") {
                    def commitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def commitMessage = sh(script: "git log -5 --pretty=format:'%s'", returnStdout: true).trim()
                
                    echo 'Deployment succeeded'
                    slackSend(
                        channel: "${env.SLACK_CHANNEL}",
                        color: 'good',
                        message: ":tada: *Deployment Completed Successfully* \n" +
                                 "*Image:* ${env.IMAGE_NAME}:${env.IMAGE_TAG}\n" +
                                 "*Branch:* ${env.GIT_BRANCH}\n" +
                                 "*Commit Author:* ${commitAuthor}\n" +
                                 "*Commit Message:* ${commitMessage}\n" +
                                 "*Commits:* \n${env.COMMIT_INFO}\n" +
                                 "*Status:* Succeeded\n" +
                                 "*Date & Time (IST):* ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}",
                        tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
                    )
                }
            }
        }
        failure {
            script {
                // Ensure we are in the workspace directory for git commands
                dir("${env.WORKSPACE}") {
                    def commitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def commitMessage = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()

                    echo 'Deployment failed'
                    slackSend(
                        channel: "${env.SLACK_CHANNEL}",
                        color: 'danger',
                        message: ":alert: *Deployment Failed* \n" +
                                 "*Image:* ${env.IMAGE_NAME}:${env.IMAGE_TAG}\n" +
                                 "*Branch:* ${env.GIT_BRANCH}\n" +
                                 "*Commit Author:* ${commitAuthor}\n" +
                                 "*Commit Message:* ${commitMessage}\n" +
                                 "*Commits:* \n${env.COMMIT_INFO}\n" +
                                 "*Status:* Failed\n" +
                                 "*Date & Time (IST):* ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}\n" +
                                 "*Please review the Jenkins logs for further information.*",
                        tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
                    )
                }
            }
             always {
            cleanWs() // Clean workspace after capturing necessary information
            }
        }
    }


// hello this is divyesh 
// hello dj 

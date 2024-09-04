pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "latest"
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
                    env.COMMIT_INFO = sh(script: "git log --pretty=format:'%an: %s' ${GIT_PREVIOUS_SUCCESSFUL_COMMIT}..HEAD", returnStdout: true).trim()
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
    }

    post {
        success {
            script {
                // Ensure we are in the workspace directory for git commands
                dir("${env.WORKSPACE}") {
                    def commitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def commitMessage = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
                
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
}


// hello this is divyesh 

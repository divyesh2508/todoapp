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
        SLACK_CHANNEL = '#jenkin' // Change this to your Slack channel
        SLACK_CREDENTIAL_ID = 'jenkins-git-cicd3' // The ID of the Slack credential you created in Jenkins
        CONTAINER_NAME = 'todoserver'
        S3_BUCKET_NAME = "my-todo-app-test"
        ENV_FILE_PATH = ".env"
        AWS_CREDENTIALS_ID = 'aws-creds'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the repository
                checkout scm
            }
        }
        stage('Build') {
            steps {
                echo 'Building'
                script {
                    def myImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    docker.withRegistry("${AWS_ACCOUNT_URL}", "ecr:${AWS_DEFAULT_REGION}:aws-creds") {
                        myImage.push("${IMAGE_TAG}")
                    }
                    echo "${env.GIT_BRANCH}"
                }
            }
        }   
        stage('Deploy') {
            steps {
                sshagent(credentials: ['todo-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no 'jenkins'@$INSTANCE_IP "sh /apps/deploy-todo-app.sh"
                    '''
                }
            }
        }
    }

    post {
        success {
            script {
                // Run git commands within the checked-out repository directory
                dir("${env.WORKSPACE}") {
                    def commitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def commitMessage = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
                
                    echo 'Deployment succeeded'
                    slackSend(
                        channel: "${env.SLACK_CHANNEL}",
                        color: 'good',
                        message: ":tada: *Hello @channel on Test Server Deployment Completed...* \n" +
                                 "*Image:* ${env.IMAGE_NAME}:${env.IMAGE_TAG}\n" +
                                 "*Branch:* ${env.GIT_BRANCH}\n" +
                                 "*Commit Author:* ${commitAuthor}\n" +
                                 "*Commit Message:* ${commitMessage}\n" +
                                 "*Status:* Succeeded\n" +
                                 "*Date & Time (IST):* ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}",
                        tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
                    )
                }
            }
        }
        failure {
            script {
                // Run git commands within the checked-out repository directory
                dir("${env.WORKSPACE}") {
                    def commitAuthor = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    def commitMessage = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()

                    echo 'Deployment failed'
                    slackSend(
                        channel: "${env.SLACK_CHANNEL}",
                        color: 'danger',
                        message: ":alert: *Hello @channel on Test Server Deployment Failed...* :alert: \n" +
                                 "*Image:* ${env.IMAGE_NAME}:${env.IMAGE_TAG}\n" +
                                 "*Branch:* ${env.GIT_BRANCH}\n" +
                                 "*Commit Author:* ${commitAuthor}\n" +
                                 "*Commit Message:* ${commitMessage}\n" +
                                 "*Status:* Failed\n" +
                                 "*Date & Time (IST):* ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}\n" +
                                 "*Please review the Jenkins logs for further information.*",
                        tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
                    )
                }
            }
        }
        always {
            cleanWs()
        }
    }
}

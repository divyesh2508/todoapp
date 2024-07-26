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
        LOG_FILE_PATH = '/tmp/old_container_logs.txt'
    }

    stages {
        stage('Build') {
            steps {
                script {
                    def errorMsg = ''
                    try {
                        echo 'Building'
                        def myImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                        docker.withRegistry("${AWS_ACCOUNT_URL}", "ecr:${AWS_DEFAULT_REGION}:aws-creds") {
                            myImage.push("${IMAGE_TAG}")
                        }
                        echo "${env.GIT_BRANCH}"
                    } catch (Exception e) {
                        errorMsg = e.message
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        if (errorMsg) {
                            currentBuild.description = "Build Error: ${errorMsg}"
                        }
                    }
                }
            }
        }
        stage("Trivy Scan") {
            steps {
                script {
                    def errorMsg = ''
                    try {
                        sh(script: "trivy image ${IMAGE_NAME}:${IMAGE_TAG}", returnStdout: true, returnStatus: true).trim()
                    } catch (Exception e) {
                        errorMsg = e.message
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        if (errorMsg) {
                            currentBuild.description = "Trivy Scan Error: ${errorMsg}"
                        }
                    }
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                script {
                    def errorMsg = ''
                    try {
                        echo 'Running SonarQube Analysis'
                        docker.image('sonarsource/sonar-scanner-cli:latest').inside {
                            withSonarQubeEnv('SonarQube') {
                                sh 'sonar-scanner'
                            }
                        }
                    } catch (Exception e) {
                        errorMsg = e.message
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        if (errorMsg) {
                            currentBuild.description = "SonarQube Analysis Error: ${errorMsg}"
                        }
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    def errorMsg = ''
                    try {
                        sshagent(credentials: ['todo-key']) {
                            sh '''
                                ssh -o StrictHostKeyChecking=no 'jenkins'@$INSTANCE_IP "sh /apps/deploy-todo-app.sh"
                            '''
                        }
                    } catch (Exception e) {
                        errorMsg = e.message
                        currentBuild.result = 'FAILURE'
                        throw e
                    } finally {
                        if (errorMsg) {
                            currentBuild.description = "Deploy Error: ${errorMsg}"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            slackSend(
                channel: "${env.SLACK_CHANNEL}",
                color: 'good',
                message: ":tada: *Hello @channel on Test Server Deployment Completed...* \n" +
                        "*Image:* ${env.IMAGE_NAME}:${env.IMAGE_TAG}\n" +
                        "*Branch:* ${env.GIT_BRANCH}\n" +
                        "*Status:* Succeeded\n" +
                        "*Date & Time (IST):* ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}"
            )
        }
        failure {
            script {
                def oldLogs = ''
                if (fileExists("${env.LOG_FILE_PATH}")) {
                    oldLogs = readFile("${env.LOG_FILE_PATH}").trim()
                }
                slackSend(
                    channel: "${env.SLACK_CHANNEL}",
                    color: 'danger',
                    message: ":alert: *Hello @channel on Test Server Deployment Failed...* :alert: \n" +
                            "*Image:* ${env.IMAGE_NAME}:${env.IMAGE_TAG}\n" +
                            "*Branch:* ${env.GIT_BRANCH}\n" +
                            "*Status:* Failed\n" +
                            "*Date & Time (IST):* ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}\n" +
                            "*Error Log:* ${currentBuild.description}\n" +
                            "*Old Container Logs:* ```${oldLogs}```\n" +
                            "*Please review the Jenkins logs for further information.*",
                    tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
                )
            }
        }
        always {
            cleanWs()
        }
    }
}

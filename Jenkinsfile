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
    }

    stages {
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

        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube Analysis'
                script {
                    docker.image('sonarsource/sonar-scanner-cli:latest').inside {
                        withSonarQubeEnv('SonarQube') {
                            sh 'sonar-scanner'
                        }
                    }
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
        failure {
            echo 'Deployment failed'
            script {
                // Collect logs from the latest container
                def containerLogs = sh(script: '''
                    ssh -o StrictHostKeyChecking=no 'jenkins'@$INSTANCE_IP 'docker logs \$(docker ps -q -f name=todoserver)' || echo 'No logs available'
                ''', returnStdout: true).trim()
                
                // Send container logs to Slack
                slackSend(
                    channel: "${env.SLACK_CHANNEL}",
                    color: 'danger',
                    message: "Deployment failed. Container logs:\n${containerLogs}",
                    tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
                )
            }
        }
        success {
            echo 'Deployment succeeded'
            slackSend(
                channel: "${env.SLACK_CHANNEL}",
                color: 'good',
                message: "Deployment of ${env.IMAGE_NAME}:${env.IMAGE_TAG} succeeded",
                tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
            )
        }
        always {
            cleanWs()
        }
    }
}

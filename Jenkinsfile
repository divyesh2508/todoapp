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
        stage("Trivy Scan") {
            steps{
               sh "trivy image ${IMAGE_NAME}:${IMAGE_TAG}"
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
    success {
        echo 'Deployment succeeded'
        slackSend(
            channel: "${env.SLACK_CHANNEL}",
            color: 'good',
            message:":tada: *Deployment Complete!*
                    *Image:* ${env.IMAGE_NAME}:${env.IMAGE_TAG}
                    *Branch:* ${env.GIT_BRANCH}
                    *Status:* Succeeded
                    *Date & Time (IST):* ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}",
            // message: "*Hello @channel on Test Server Deployment of ${env.IMAGE_NAME}:${env.IMAGE_TAG}* on branch *${env.GIT_BRANCH}* succesfully on *${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}*",
            tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
        )
    }
    failure {
        echo 'Deployment failed'
        slackSend(
            channel: "${env.SLACK_CHANNEL}",
            color: 'danger',
           
            message: "*Hello @channel on Test Server Deployment of ${env.IMAGE_NAME}:${env.IMAGE_TAG}* on branch *${env.GIT_BRANCH}* failed on *${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Kolkata'))}*. Please check the Jenkins logs for details.",
            tokenCredentialId: "${env.SLACK_CREDENTIAL_ID}"
        )
    }
    always {
        cleanWs()
    }
}




}
